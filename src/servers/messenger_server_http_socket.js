/**
 * Created by Luky on 2017/10/19
 */
const io=require('socket.io');
const config=global.server_config||require('../config/config');
const _=require('lodash');
const Server=require('./messenger_server');
const {Parser}=require('../log/log');

class HttpSocketServer extends Server{
    constructor(hostServer,port,path){
        super(hostServer);
        this._port=port||_.get(config,'state_server.port',3001);
        this._path=path||_.get(config, 'state_server.path', '/stateServer');
        Parser(this,'server_http_socket.js',{port:this._port,path:this._path});
    }

    start(){
        this.stop();
        return new Promise((resolve,reject)=>{
            let server=io({
                path:this._path,
                serveClient:false
            });
            let httpServer = require('http').createServer();
            let errorBind=(err)=>{
                httpServer.removeListener('error',errorBind);
                if(err.code==='EACCES'||err.code==='EADDRINUSE'){
                    this.error('端口被占用,服务启动失败',{innerError:err});
                }
                else{
                    this.error('其他未知错误,服务启动失败',{innerError:err})
                }
                reject(err);
            };
            let onListen=()=>{
                httpServer.removeListener('listening',onListen);
                this._server=server;
                this._httpServer=httpServer;
                let ct=0;
                server.on('connection',(client)=>{
                    ct++;
                    let ip=_.get(client,'conn.remoteAddress');
                    this.log('新客户端登陆',{ip:ip,count:ct});
                    this.emit(Server.Events.newClient,client);
                    client.on('disconnection',()=>{
                        client.removeAllListeners();
                        ct--;
                        this.log('客户端退出',{ip:ip,count:this.clients.size});
                    });
                    client.on('clear',(cmd)=>{
                        this._onReceiveMsgIntrusionAlert(cmd.hid);
                    });
                    client.on('error',(err)=> {
                        this.error('客户端异常',{innerError:err.toString()});
                    });
                });

                this.log('服务器启动');
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
        if(this._server){
            this._server.removeAllListeners();
            this._server.close();
            this._server=null;
            this._httpServer.close(e=>e);
            this._httpServer=null;
            this.log('服务器已关闭，端口释放');
        }
    }

    notifyHostStateChanged(msg){
        this._server&&this._server.emit('update',msg,{for:'everyone'});
    }

    notifyHostsState(client,msg){
        client.emit('init',msg);
    }
}

exports=module.exports=HttpSocketServer;