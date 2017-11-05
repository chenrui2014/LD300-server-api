/**
 * Created by Luky on 2017/6/29.
 */

const EventEmitter=require('events').EventEmitter;
const WebSocket = require('ws');
const config=require('../../config/config');
const _=require('lodash');
const factory=require('./ipc_factory');
const Cache=require('./cache/to_flv_cache');
const FLVEncoder=require('../flv/flv_encoder');
const Persistence=require('./persistence');
let fs=require('fs');

class Live extends EventEmitter{
    constructor(server,id,path,options){
        super();
        this._server=server;
        this._wss=null;
        this._cache=null;
        this._id=id;
        this._persistence=new Persistence(options);
        options=options||{};
        this.options={};
        this.options.autoClose=options.autoClose||false;
        path=path||_.get(config,'ipc_server.path','/live');
        this._path=`${path}/${id}`;
    }

    get path(){
        return this._path;
    }

    stopArrchive(){
        if(!this._file)return;
        if(this._cache){
            this._cache.removeClient(this._fileSend);
        }
        this._file.close();
        this._file=null;
        this._fileSend=null;
    }

    arrchive(prefix){
        if(this._file)return;
        let file=this._file=fs.createWriteStream(this._persistence.videoPath(prefix,'flv'));
        let startTime=0;
        let send=this.fileSend=(data,options)=>{
            let timestamp=0;
            if(options.type==='tag'&&options.tagType==='video'&&options.dataType==='data'){
                if(startTime===0) startTime=options.time;
                timestamp=options.time-startTime;
                FLVEncoder.setTimestamp(data,timestamp);
            }
            file.write(data);
        }
        this._cache.addClient(send);
    }

    log(desc){
        console.log(JSON.stringify({
            source:'live_server.js',
            desc:desc
        }));
    }

    error(desc){
        console.error(JSON.stringify({
            source:'live_server.js',
            desc:desc
        }));
    }

    //hid不为空时需要将视频存档
    open(){
        this.close();
        let wss=this._wss=new WebSocket.Server({
            server:this._server,
            path:this._path,
            verifyClient:(/*info*/)=>{
                return true;
            }
        });

        let ipc=factory.getIPC(this._id);
        if(!ipc){
            return '';
        }
        this._ipc=ipc;
        ipc.connect().catch(e=>e);
        let cache=this._cache=new Cache(true,ipc.supportAudio);
        ipc.on('video',(data)=>{
            cache.write(data);
        });

        ipc.realPlay().then().catch();

        this._clientAliveTest= setInterval(()=>{
            if(!this._wss.clients.size){
                if(this.options.autoClose) return this.close();
                return;
            }
            _.each(this._wss.clients,(ws)=>{
                if (ws.isAlive === false) return ws.terminate();
                ws.isAlive = false;
                ws.ping('', false, true);
            });
        }, 60*1000);

        wss.on('error',(err)=>{
            this.error(err.toString());
        });

        wss.on('connection', (ws/*, req*/) => {
            //const uri = url.parse(req.url, true);
            ws.on('pong',()=>{
                ws.isAlive=true;
            });
            let send=(data)=>{
                if (ws.readyState === WebSocket.OPEN) {
                    ws.send(data);
                }
            };
            ws.on('close', (code, reason) => {
                cache.removeClient(send);
                this.log(`Websocket连接关闭code:${code},reason${reason}，ipcid:${this._id}`);
            });
            cache.addClient(send);
        });
        this.log(`摄像头直播服务已启动,摄像头编号${this._id}`);
    }

    close(){
        if(!this._wss) return;
        clearInterval(this._clientAliveTest);
        delete this._clientAliveTest;this._clientAliveTest=0;
        this.stopArrchive();
        if(this._ipc){
            this._ipc.stopRealPlay().then().catch();
            this._ipc=null;
        }
        if(this._cache){
            this._cache.clear();
            this._cache=null;
        }
        if(this._wss){
            this._wss.close(()=>{});
            this._wss=null;
        }
        this.log(`摄像头直播服务已关闭,摄像头编号${this._id}`);
        this.emit('close');
    }
}

exports=module.exports=Live;