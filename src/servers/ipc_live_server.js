/**
 * Created by Luky on 2017/6/29.
 */

const EventEmitter=require('events').EventEmitter;
const WebSocket = require('ws');
const config=global.server_config||require('../config/config');
const _=require('lodash');
const factory=require('./ipc_factory');
const url=require('url');
const assert=require('assert');
//const timeSpan=require('../TimeSpan');
const Cache=require('./cache/to_flv_cache');
const FLVEncoder=require('../flv/flv_encoder');
const Persistence=require('./ipc_video_persistence');
let fs=require('fs');
const {Parser}=require('../log/log');

class Live extends EventEmitter{
    constructor(server,ipc,options){
        super();
        this._server=server;
        this._wss=null;
        this._ipc=ipc;
        this._cache=null;
        this._persistence=new Persistence(_.get(options,'persistence',null));
        this.options={
            autoClose:_.get(options,'autoClose',true)
        };
        let path=_.get(options,'server.path','/live');
        this._path=`${path}/${ipc.id}`;
        Parser(this,'ipc_live_server.js',{id:ipc.id,path:this._path});
    }

    get path(){
        return this._path;
    }

    stopArrchive(){
        if(!this._file)return;
        let path=this._file.path;
        if(this._cache){
            this._cache.removeClient(this._fileSend);
        }
        this._file.close();
        this._file=null;
        this._fileSend=null;
        this.emit('fileClosed',this.log('直播流与文件写入通道关闭',{path:path}));
        this.tryAutoClose();
    }

    async arrchive(prefix){
        if(this._file)return this._file.path;
        let ok=await this._play().catch(()=>{return false;});
        if(!ok) return '';
        let path=this._persistence.videoPath(prefix,'flv');
        let file=this._file=fs.createWriteStream(path);
        let startTime=0;
        let send=this._fileSend=(data,options)=>{
            let timestamp=0;
            if(options.type==='tag'&&options.tagType==='video'&&options.dataType==='data'){
                if(startTime===0) startTime=options.time;
                timestamp=options.time-startTime;
                FLVEncoder.setTimestamp(data,timestamp);
            }
            file.write(data);
        };
        this._cache.addClient(send);
        this.emit('file',this.log('建立直播流与文件的写入通道',{path:path}));
        return path;
    }

    async _play(){
        if(this._cache) return true;
        let ipc=this._ipc;
        await ipc.connect().catch(e=>{
            throw new Error(this.error('摄像头连接出错',{innerError:e}));
        });
        let cache=new Cache(true,ipc.supportAudio);
        let videoToCache=(data)=>{
            cache.write(data);
        };
        ipc.on('video',videoToCache);
        await ipc.realPlay().catch((e)=>{
            cache.clear();
            cache=null;
            ipc.removeListener('video',videoToCache);
            throw new Error(this.error('无法获取直播流',{innerError:e}))
        });
        this.log('获取直播流');
        this._cache=cache;
        this._videoToCache=videoToCache;
        return true;
    }

    _stopPlay(){
        if(!this._cache) return;
        this._ipc.removeListener('video',this._videoToCache);
        this._videoToCache=null;
        this._ipc.stopRealPlay().catch();
        if(this._cache){
            this._cache.clear();
            this._cache=null;
        }
        this.log('关闭直播流');
    }

    _closeWSS(){
        if(!this._wss) return;
        clearInterval(this._clientAliveTest);
        this._clientAliveTest=0;
        if(this._wss){
            this._wss.close(()=>{});
            this._wss=null;
        }
        this.log('直播流关闭');
        this.tryAutoClose();
    }

    get running(){
        return !!this._wss;
    }

    tryAutoClose(){
        if(!this.options.autoClose)return;
        if(this._file||this._wss) return;
        this.close();
    }

    async openWSS(){
        if(this._wss) return true;
        if(!await this._play().catch(()=>{return null;})) return false;
        let wss=this._wss=new WebSocket.Server({
            server:this._server,
            path:this._path,
            verifyClient:(/*info*/)=>{return true;}
        });

        this._clientAliveTest= setInterval(()=>{
            if(!this._wss.clients.size){
                return this._closeWSS();
            }
            this._wss.clients.forEach((ws)=>{
                if (ws.isAlive === false) return ws.terminate();
                ws.isAlive = false;
                ws.ping('', false, true);
            });
        }, 10000);

        wss.on('error',(err)=>{
            this.error('摄像头推流服务异常',{innerError:err});
        });

        wss.on('connection', (ws/*, req*/) => {
            //const uri = url.parse(req.url, true);
            ws.on('pong',()=>{
                ws.isAlive=true;
            });
            let send=(data,/*options*/)=>{
                if (ws.readyState === WebSocket.OPEN) {
                    //console.log(`输出时长${(options.time-send.time0)/1000}`);
                    ws.send(data);
                }
            };
            ws.on('close', (code, reason) => {
                this._cache.removeClient(send);
                this.log('客户端连接关闭',{code:code,reason:reason});
            });
            this._cache.addClient(send);
        });
        this.emit('open',this.log('摄像头直播服务已启动,摄像头编号'));
        return true;
    }

    close(){
        this.stopArrchive();
        this._closeWSS();
        this._stopPlay();
        this.emit('close',this.log(`摄像头直播服务关闭`));
    }
}

exports=module.exports=Live;