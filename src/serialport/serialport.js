/**
 * Created by Wxf on 2017/9/8.
 */

const _=require('lodash');
const config=global.server_config||require('../config/config');
const SerialPort=require('serialport');
const EventEmitter=require('events').EventEmitter;
const ByteLength = SerialPort.parsers.ByteLength;
const {Parser} =require('../log/log');

const _Events={
    Open:'open',
    Close:'close',
    Error:'error',
    Data:'data',
    //offline之后再连接为online
    Online:'online',
    Offline:'offline'
};

const _Errors={
    openError: 'openError',
    writeError: 'writeError',
    closeError:'closeError',
    Other: 'other'
};

class Com extends EventEmitter{
    constructor(port,options){
        super();
        if(_.isNumber(port)){
            port=`\\\\.\\COM${port}`;
        }
        this.port=port;
        this._timeHandle=0;
        this._stopReConnect=false;
        this._lastData=Buffer.alloc(0);
        this.options= {
            timeOut:3000,
            tryTimes:-1,
            trySpan:5000,
            deDuplication:false
        };
        _.extend(this.options,_.get(config,'serialPort'),options,{autoOpen:false});
        this._received=0;
        this._received_bak=0;
        this._start=0;
        Parser(this,'serialport.js',{port:port});
    }

    isDuplication(data) {
        if(!this.options.deDuplication) return false;
        if(this._lastData.equals(data)){
            return true;
        }
        this._lastData=data;
        return false;
    }

    stopReConnect(){
        this._stopReConnect=true;
        clearTimeout(this._timeHandle);
        this._timeHandle=0;
    }

    _reConnect(){
        if(this.options.tryTimes===0) return Promise.resolve();
        let tryTimes=this.options.tryTimes;
        let span=this.options.trySpan;
        return this.disConnect().then(()=>{
            return new Promise((resolve,reject)=>{
                let time=0,start=new Date().getTime();
                let restart=()=>{
                    this._connect().then(()=>{
                        this.emit(_Events.Online,this.log(`端口成功打开,第${time}次尝试`));
                        time=0;
                        resolve({times:time});
                    }).catch(()=>{
                        time++;
                        this.emit(_Events.Offline,this.warn(`重连失败,第${time}次尝试`,{times:time,duration:(new Date().getTime()-start)}));
                        if(this._stopReConnect){
                            this._stopReConnect=false;
                            return reject({times:time});
                        }
                        if(tryTimes===-1){
                            this._timeHandle=setTimeout(restart,span);
                            return;
                        }
                        if(tryTimes===0)return reject({times:time});
                        tryTimes--;
                    });
                };
                restart();
            });
        });

    }

    get isConnected() {
        if(!this.serialPort) return false;
        return this.serialPort.isOpen;
    }

    write(data){
        if(!this.serialPort) return Promise.reject('端口未连接，无法发送信号');
        return new Promise((resolve,reject)=>{
            this.serialPort.write(data,'binary',(err)=>{
                if(err){
                    let log=this._error(_Errors.writeError,'指令发送失败',{innerError:err.toString()});
                    return reject(log);
                }
                this.serialPort.drain((err)=>{
                    if(err){
                        let log=this._error(_Errors.writeError,'指令发送失败,未送出',{innerError:err.toString()});
                        return reject(log);
                    }
                    resolve();
                });
            });
        });
    }

    _connect()
    {
        return this.disConnect().then(()=>{
            return new Promise((resolve,reject)=>{
                let port = new SerialPort(this.port,this.options);
                let receive=(data)=>{
                    this._received+=data.length;
                    //1024B *100
                    if(this._received-this._received_bak>102400){
                        this._received_bak=this._received;
                        this.log(`接受到数据${this._received_bak}KB,运行时长${(new Date().getTime()-this._start)/1000}分`)
                    }
                    if(this.isDuplication(data))return;
                    this.emit('data',data,this.port);
                };

                port.on('close', (e) => {
                    //file.close();
                    //网线拔掉以后会有关闭事件
                    port.removeAllListeners();
                    if(this.serialPort) delete this.serialPort;
                    port=null;
                    this.emit(_Events.Close, this.log('端口关闭',{type: _Events.Close}));
                    if(e&&e.disconnected){
                        this._reConnect().catch();
                    }
                });

                //Callback is called with an error object whenever there is an error.
                port.on('error', (err) => {
                    this.emit(_Events.Error,this._error(_Errors.Other,'端口异常',{innerError:err.toString()}));
                    this.disConnect();
                });

                port.open((e) =>{
                    if (e) {
                        port.removeAllListeners();
                        return reject(e);
                    }
                    this._received=0;
                    this._received_bak=0;
                    this._start=new Date().getTime();
                    this.serialPort=port;
                    let parser=this.parser = port.pipe(new ByteLength({length: this.options.byteLength}));
                    parser.on('data', receive);
                    resolve();
                });
            });
        });
    }

    connect(){
        return new Promise((resolve,reject)=>{
            this._connect().then(()=>{
                this.emit(_Events.Open, this.log('端口打开成功',{type: _Events.Open}));
                resolve();
            }).catch((e)=>{
                if(this.options.tryTimes!==0) {
                    return this._reConnect().then(data=>resolve(data)).catch(e=>reject(e));
                }
                let desc='端口打开出错';
                if(e.message){
                    if(e.message.indexOf('File not found')>-1){
                        desc='端口未找到';
                    }
                    else if(e.message.indexOf('Access denied')>-1){
                        desc='端口以被其他应用占用，请确认';
                    }
                }
                let log=this._error(_Errors.openError,desc,{innerError:e.toString()});
                this.emit(_Events.Error,log);
                reject(log);
            });
        });
    }

    disConnect(){
        this._lastData=Buffer.alloc(0);
        if(!this.serialPort) return Promise.resolve();
        this.parser.unpipe(this.serialPort);
        this.parser=null;
        return new Promise((resolve,reject)=>{
            this.serialPort.close((err)=>{
                if(err){
                    let data=this._error(_Errors.closeError,'端口关闭异常',{innerError:err.toString()});
                    this.emit(_Events.error,data);
                    return reject(data);
                }
                this.log('端口应要关闭');
                return resolve();
            });
        });
    }

    _error(type,desc,params){
        return this.error(desc,_.extend({
            type: _Events.Error,
            errorType: type,
        },params));
    }

    static get Events(){
        return _Events;
    }

    static get Errors() {
        return _Errors;
    }
}

exports=module.exports= Com;