/**
 * Created by Luky on 2017/7/20.
 */

const EventEmitter=require('events').EventEmitter;
const io=require('socket.io');
const assert=require('assert');
const _=require('lodash');
const path=require('path');
const crypto = require('crypto');
const factory=require('./ipc_factory');
const url=require('url');
const Writable = require('stream').Writable;
const config=global.server_config||require('../config/config');
const ptzLock=_.get(config,'ipc.ptzLock',15000);

class Live extends  EventEmitter{
    constructor(port,_path){
        super();
        this._port=port||_.get(config,'ipc_server.port',3000);
        this._path=_path||_.get(config,'ipc_server.path','/live');
        this._open();
        this._rooms={};
    }

    get path(){
        return {port:this._port,path:this._path};
    }

    _open(){
        if(this._server) return;
        let socket=this._server=io({
            path:this._path,
            serveClient:false
        });
        //socket.origins(['*']);
        socket.listen(this._port);
        socket.on('connection',(client)=>{
            let uri=url.parse(client.request.url,true);
            let user=client.id;
            const roomIDRegExp=new RegExp(`${this.path.path}\\/(\\d+)`,'i');
            let id=_.last(roomIDRegExp.exec(uri.path)||[-1])-0;
            let freePTZ=(zoom)=>{
                delete zoom.freePTZ;
                delete zoom.ptz;
            };
            let play=(id,preset,persistence)=>{
                let ipc=factory.getIPC(id);
                if(!ipc){
                    client.emit('play',{type:'error',msg:'请求的摄像头不存在'});
                    return;
                }
                if(id in this._rooms){
                    client.join(id);
                    this._rooms[id].client++;
                    client.emit('play',{type:'succeed',msg:'成功加入监控'});
                    return;
                }
                ipc.play(preset).then(()=>{
                    client.join(id);
                    this._rooms[id]={client:1,ipc:ipc};
                    ipc.on('data',(data)=>{
                        socket.to(id).emit('stream',data/*,{for:'everyone'}*/);
                    });
                    if(persistence){
                        ipc.pipe(this,{end:false});
                    }
                    client.emit('play',{type:'succeed',msg:'成功加入监控'});
                }).catch((err)=>{
                    client.emit('play',{type:'error',msg:`请求的摄像头工作异常,内部错误信息为${err}`});
                });
            };
            if(id!==-1){
                play(id,uri.search.preset,uri.search.persistence);
            }
            client.on('play',play);
            client.on('ptz',(id,method,args)=>{
                assert.ok(user in client.rooms);
                assert.ok(this._rooms[id].client>0);
                let zoom=this._rooms[id];
                if(zoom[id].ptz&&zoom.ptz!==user){
                    client.emit('ptz',{type:'locked',msg:`云台正在被使用中,内部码${zoom.ptz}`});
                    return;
                }
                zoom.ptz=user;
                zoom.freePTZ=zoom.freePTZ||freePTZ.bind(null,zoom);
                _.throttle(zoom.freePTZ,ptzLock);
                assert.ok(['zoomIn','zoomOut','focusIn','focusOut','apertureIn','apertureOut','move','moveToPoint','ptzStop'].indexOf(method)!==-1);
                zoom.ipc[method].apply(zoom.ipc,args);
            });
            client.on('disconnect', (reason) => {

            });
            client.on('leave',(id)=>{
                client.emit('leave',{type:'succeed',msg:'成功退出监控'});
                assert.ok(id in this._rooms);
                this._rooms[id].client--;
                if(0===this._rooms[id].client){
                    let ipc=factory.getIPC(id);
                    ipc.unpipe(this);
                    ipc.stopPlay().then(()=>{}).catch(()=>{});
                }
                client.leave(id);
            });
        });
    }

    _close(){
        if(this._server){
            this._server.removeAllListeners();
            this._server.close();
            this._server=null;
        }
    }
}
/*

function randomPath(){
    const hash = crypto.createHash('md5');
    hash.update(new Date().getTime().toString());
    return hash.digest('hex').slice(0,8);
}
*/

exports=module.exports=new Live();