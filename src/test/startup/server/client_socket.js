const _=require('lodash');
const net=require('net');
const EventEmitter=require('events').EventEmitter;
const {Parser}=require('../../../app/log/log');

class Client extends EventEmitter{
    constructor(host,port){
        super();
        this.host=host||null;
        this.port=port;
        this.client=null;
        Parser(this,'client_socket.js',{port:this.port,host:this.host||'localhost'});
    }

    reconnect(){
        let time=0;
        let restart=()=>{
            this.start().then(()=>{
                time=0;
                this.log('服务自动重连成功');
            }).catch(()=>{
                this.warn(`服务重连失败`,{times:time++});
                setTimeout(restart,5000);
            });
        };
        restart();
    }

    start(/*com*/){
        this.stop();
        return new Promise((resolve,reject)=>{
            let client=net.Socket({
                readable: true,
                writable: true
            });
            client.connect({port:this.port,host:this.host},()=>{
                this.log('已连接服务器');
                this.client=client;
                return resolve();
            });
            client.on('error',(err)=>{
                if(err.code==='ENOENT'){
                    return reject(this.error('服务器未找到'));
                }
                this.error(`内部错误,${err.toString()}`);
            });
            client.on('data',(data)=>{
                /*const {id,data}=unpackageData(data1);
                com.write(data,id);*/
                this.log('收到数据',{data:data.toString('hex')});
                this.emit('data',data);
            });
            client.on('close', (had_error)=> {
                client.removeAllListeners();
                if(had_error){
                    this.error('服务器关闭或连接错误');
                    this.reconnect();
                    //尝试重连服务器
                }
                else this.log('连接正常关闭');
            });
        });
    }

    write(data){
        if(this.client){
            this.client.write(data);
        }
    }

    stop(){
        if(this.client){
            this.client.destroy();
            this.client=null;
        }
    }
}


exports=module.exports=Client;