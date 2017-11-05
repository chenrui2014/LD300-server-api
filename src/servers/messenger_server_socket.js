/**
 * Created by Luky on 2017/10/19
 */

const config=global.server_config||require('../config/config');
const _=require('lodash');
const Server=require('./messenger_server');
const {Parser}=require('../log/log');
const net = require('net');
const CmdFormatter=require('./interfaces/cmd_formatter');
const assert=require('assert');

class CmdSplitter{
    constructor(cb){
        this._cb=cb;
        this._cache=null;
        this._expected=0;
    }

    append(data)
    {
        do{
            if(!data.length)return;
            if(this._expected===0){
                this._expected=data.readUInt8(0);
            }
            if(this._expected>data.length){
                if(null===this._cache) this._cache=data;
                else this._cache=Buffer.concat([this._cache,data]);
                this._expected-=data.length;
                return;
            }
            if(this._cache===null){
                this._cb(data.slice(0,this._expected));
                data=data.slice(this._expected);
                this._expected=0;
            }
            else{
                this._cb(Buffer.concat(this._cache,data.slice(0,this._expected)));
                this._cache=null;
                data=data.slice(this._expected);
                this._expected=0;
            }
        }while(true);
    }
}

class SocketServer extends Server
{
    constructor(hostServer,port,cmdFormatter){
        super(hostServer);
        this._port=port||_.get(config,'state_server.port',3001);
        this._server=null;
        this._clients=new Set();
        this._index=0;
        this._cmdFormater=cmdFormatter;
        if(!(cmdFormatter instanceof CmdFormatter)) throw new Error('未找到集成接口,服务无法正常运行');
        Parser(this,'server_socket.js',{port:this._port});
    }

    get _nextIndex(){
        return this._index=((++this._index)&0xfff);
    }

    _onReceiveCmd(client,cmd){
        let rec=this._cmdFormater.formatReceived(cmd);
        switch(rec.type){
            case CmdFormatter.CmdReceived.clear:
                this._onReceiveMsgIntrusionAlert(rec.hid);
                this.log('收到复位命令',{cmd:cmd.toString('hex'),translation:rec,client:client.address()});
                break;
            default://CmdFormatter.CmdReceived.unKnown:
                this.warn('收到未知命令',{cmd:cmd.toString('hex'),client:client.address()});
                break;
        }
    }

    notifyHostStateChanged(evt){
        let cmd=this._cmdFormater.formatHostStateChanged(this._nextIndex,evt);
        this._clients.forEach((client)=>{
            if(cmd)client.write(cmd,()=>{
                this.log('命令已发出',{cmd:cmd.toString('hex'),original:evt,client:client.address()})
            });
        });
    }

    notifyHostsState(client,data){
        //hid,type,stateNew,position
        _.each(data,(state)=>{
            let cmd=this._cmdFormater.formatHostStateChanged(this._nextIndex,state);
            if(cmd)client.write(cmd,()=>{
                this.log('命令已发出',{cmd:cmd.toString('hex'),original:state,client:client.address()})
            });
        });
    }

    start(){
        this.stop();
        return new Promise((resolve,reject)=>{

            let server =net.createServer((socket) =>{ //'connection' listener
                socket.setKeepAlive(true,300000);
                socket.setNoDelay(true);
                socket._cmdSplitter=new CmdSplitter(this._onReceiveCmd.bind(this,socket));
                this._clients.add(socket);
                let ip=socket.address();
                this.log('新客户端登陆',{ip:ip,count:this._clients.size});
                this.emit(Server.Events.newClient,socket);
                socket.on('close', (had_error)=> {
                    delete socket._cmdSplitter;
                    this._clients.delete(socket);
                    socket.removeAllListeners();
                    if(had_error)this.warn('客户端socket错误关闭');
                    this.log('客户端退出',{ip:ip,count:this._clients.size});
                });
                //之后所有命令保证第一个8bit为数据的长度，socket会保证一次输出为8bit指定的命令长度
                socket.on('data',(data)=>{
                    socket._cmdSplitter.append(data);
                });
                socket.on('error',(err)=> {
                    this.error('客户端异常',{innerError:err.toString()});
                });
            });

            server.on('error',(err)=>{
                if(err.code==='EACCES'){
                    return reject(this.error('端口被占用,服务启动失败'));
                }
                reject(this.error('内部错误,服务启动失败',{innerError:err.toString()}));
            });

            server.on('close',()=>{
                this.log('服务器已关闭，端口释放');
                server.removeAllListeners();
                server=null;
            });

            server.listen(this._port,()=>{ //'listening' listener
                this._server=server;
                this.log('服务器启动');
                return resolve();
            });
        });
    }

    stop(){
        if(this._server){
            this._server.close();
            this._server=null;
        }
    }
}


exports=module.exports=SocketServer;