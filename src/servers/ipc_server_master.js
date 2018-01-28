/**
 * Created by Luky on 2017/8/17.
 */

const _=require('lodash');
const IPC=require('../ipcs/base/ipc');
const Data=require('./data_server');
const EventEmitter = require('events').EventEmitter;
const config=global.server_config||require('../config/config');
const store=_.get(config,'runMode.store');
const listenState=false;//_.get(config,'ipc.listen',false);
const http = require('http');
const numCPUs = require('os').cpus().length;
const numCP=Math.round(numCPUs*5/8);
const cp = require('child_process');
const url=require('url');
const path = require('path');
const childjs=global.server_config?
    path.resolve(config.root,'live.js')
    :path.resolve(config.root,'servers/ipc_server_child.js');
const {Parser}=require('../log/log');
const httpProxy =require('http-proxy');
let proxy = httpProxy.createProxyServer();

class IPCServer extends EventEmitter{
    constructor(options){
        super();
        this._workers = [];
        this._hServer=null;
        this._ipcs={};
        this.options=options||{};
        this.options.port=this.options.port||_.get(config,'ipc_server.port',3000);
        Parser(this,'ipc_server_master.js',{port:this.options.port});
    }

    _removeIpcListener(ipc,id){
        if(!this._ipc_online) return;
        ipc.removeListener('online',this._ipc_online);
        ipc.removeListener('offline',this._ipc_offline);
    }

    _addIpcListener(ipc,id) {
        this._ipc_online=this._ipc_online||this.emit.bind(this,IPC.Events.Online);
        this._ipc_offline=this._ipc_offline||this.emit.bind(this,IPC.Events.Offline);
        ipc.on('online',this._ipc_online);
        ipc.on('offline',this._ipc_offline);
    }

    _onProcessMessage(worker,event){
        if(event.type==='listening'){
            worker.port=event.port;
        }
        else if(event.type==='countChanged'){
            const ct=worker.payload=event.count;
            if(0===ct) this._ipcs[event.id].worker=null;
            else this._ipcs[event.id].worker=worker;
            this._workers=_.orderBy(this._workers,['payload']);
        }
        this.log('收到子进程消息',{innerEvent:event,port:worker.port});
    }

    findWorker(id){
        return _.get(this._ipcs,`${id}.worker`,null);
    }

    async start(){
        let ipcs=await Data.getIPCIDsSortByPoint().catch(()=>{
            return Promise.resolve([]);
        });

        if(!ipcs||!ipcs.length) return Promise.reject('没有可连接摄像头');
        this.stop();

        let _startWorker=()=>{
            proxy.on('error',(err)=>{
                this.error('http代理返回错误',{innerError:err});
            });
            listenState&&_.forEach(ipcs,(id)=>{
                this._addIpcListener(id);
            });
            this._ipcs=_.transform(ipcs,(result,id)=>{
                result[id]={};
            });

            for (let i = 0; i < numCP; i++) {
                let args=[];
                let worker=null;
                if(process.env.NODE_ENV==='development'||process.env.NODE_ENV==='test'){
                    worker=cp.fork(childjs, args.concat([store]),{execArgv: [ '--inspect='+(process.debugPort+i+1)]});
                }
                else{
                    cp.fork(childjs, args);
                }
                let wobj={worker:worker,payload:0,start:new Date()};

                wobj.lsn=worker.on('message',this._onProcessMessage.bind(this,wobj));
                this._workers.push(wobj);
            }
        };
        return new Promise((resolve,reject)=>{
            let httpServer=http.createServer((req,res)=> {
                const uri=url.parse(req.url);
                if(uri.pathname.indexOf('/ipc/')!==0){
                    this.warn('收到未知请求',{uri});
                    res.setHeader('Content-Type','application/json; charset=utf-8');
                    res.writeHead(404, {'Content-Type': 'text/plain'});
                    res.write("服务未找到!");
                    return res.end();
                }
                let id=parseInt(uri.pathname.slice(5));
                let worker = this.findWorker(id);
                if(!worker){
                    this._workers.push(worker=this._workers.shift());
                }
                this.log('请求转发',{'Location': `http://localhost:${worker.port}` + req.url});
                //res.writeHead(302, {'Location': `http://localhost:${worker.port}`});
                //res.end();
                const target={ target: `http://127.0.0.1:${worker.port}` };
                proxy.web(req, res,target ,(e)=>{
                    this.error('转发出错',{innerError:e,target})
                });
            }).listen(this.options.port);
            let errorBind=(err)=>{
                httpServer.removeListener('error',errorBind);
                if(err.code==='EACCES'||err.code==='EADDRINUSE'){
                    this.error('端口被占用,状态服务启动失败',{innerError:err});
                }
                else{
                    this.error('其他未知错误,状态服务启动失败',{innerError:err})
                }
                reject(err);
            };
            let onListen=()=> {
                httpServer.removeListener('listening', onListen);
                _startWorker();
                this._hServer=httpServer;
                this.log('摄像头分发服务启动');
                let x=setInterval(()=>{
                    if(!_.some(this._workers,(worker)=>{
                        return !('port' in worker);
                    })){
                        clearInterval(x);
                        resolve();
                    }
                },500);
            };
            httpServer.on('error',errorBind);
            httpServer.on('listening',onListen);
        });
    }

    stop(){
        if(!this._hServer) return;
        proxy.removeAllListeners();
        listenState&&_.forEach(this._ipcs,(ipc)=>{
            this._removeIpcListener(ipc.id);
        });
        this._workers.length&&_.forEach(this._workers,(worker)=>{
            worker.worker.kill();
        });
        this._workers=[];
        this._hServer&&this._hServer.close(e=>e);
        this._hServer=null;
        this.log('摄像头分发服务停止');
    }
}

exports=module.exports=IPCServer;