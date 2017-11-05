/**
 * Created by Luky on 2017/7/17.
 */

const Host=require('../host/host');
const io=require('socket.io');
const config=require('../../config/config');
const _=require('lodash');
const EventEmitter = require('events').EventEmitter;
const {Parser}=require('../log/log');

class StateServer extends EventEmitter{
    constructor() {
        super();
        this._port=_.get(config,'state_server.port',3001);
        this._path=_.get(config, 'state_server.path', '/stateServer');
        this._state={};
        Parser(this,'host_state_server.js',{port:this._port,path:this._path});
    }

    _onHostStateChanged(evt){
        this.log('向前台同步主机状态',{innerEvent:evt});
        this._emitEveryone(this._state[`hs${evt.hid}`]=evt);
    }

    start(hostServer){
        this.stop();
        return new Promise((resolve,reject)=>{
            if(!hostServer){
                return reject('hostServer不能为空');
            }
            let server=io({
                path:this._path,
                serveClient:false
            });
            let httpServer = require('http').createServer();
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
            let onListen=()=>{
                httpServer.removeListener('listening',onListen);
                this._server=server;
                this._httpServer=httpServer;
                server.on('connection',(client)=>{
                    this.log('新客户端登陆',{ip:_.get(client,'conn.remoteAddress')});
                    client.emit('init',this._state);
                    /*client.on('disconnection',()=>{});*/
                });

                this._hostServer=hostServer;
                hostServer.on(Host.Events.StateChanged,this._host_state_changed=this._onHostStateChanged.bind(this));
                this.log('状态服务启动');
                resolve();
            };
            httpServer.on('error',errorBind);
            httpServer.on('listening',onListen);

            server.attach(httpServer, {
                pingInterval: 10000,
                pingTimeout: 5000,
                cookie: false
            });

            httpServer.listen(this._port);
        });
    }

    stop(){
        if(this._host_state_changed){
            this._hostServer.removeListener(Host.Events.StateChanged,this._host_state_changed);
            this._host_state_changed=null;
        }
        this._hostServer=null;
        if(this._server){
            this._server.removeAllListeners();
            this._server.close();
            this._server=null;
            this._httpServer.close(e=>e);
            this.log('状态服务停止');
        }
    }

    _emitEveryone(event){
        this._server&&this._server.emit('update',event,{for:'everyone'});
    }
}


exports=module.exports=StateServer;