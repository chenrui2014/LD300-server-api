/**
 * Created by Luky on 2017/6/27.
 */

const _ = require('lodash');
const SerialPort = require('../serialport/serialport');
const EventEmitter = require('events').EventEmitter;
const config=global.server_config||require('../config/config');
const {Parser} =require('../log/log');

const portOptions = _.extend({
    baudRate: 115200,
    stopBits: 2,
    dataBits: 8,
    parity:'none',
    byteLength:16
},_.get(config,'host.port'));

const _Events={
    Open:'open',
    Close:'close',
    Error:'error',
    Online:'online',
    Offline:'offline',
    StateChanged:'stateChanged'
};

const _HostErrors={
    InitError: 'initError',
    ConnectError:'connectError',
    PortError:'portError',
    RdySignalsSendError:'rdySignalsSendError'
};

const _hostState={
    Normal:'normal',
    SysReady:'sysRdy',
    Alarm:'alarm',
    Error:'error',
    Unknown:'unknown'//代表主机离线等无信号状态
};

const _Errors=_.extend({},SerialPort.Errors,_HostErrors);

const reset=new Buffer([0xAA]);
const systemReady=new Buffer([0x00]);

class SysRdySender extends EventEmitter{
    constructor(spans,cb){
        super();
        this._span=spans||[];
        this._callback=cb||function(){};
        this._index=-1;
        this._handle=0;
    }
    send(){
        this._index++;
        if(this._index>=this._span.length){
            this.emit('finish');
            this._index=-1;
            return;
        }
        this._handle=setTimeout(()=>{
            this._callback();
            this.send();
        },this._span[this._index]);
    }

    interrupt(){
        clearTimeout(this._handle);
        this._index=-1;
        this.emit('interrupted');
    }
}

class Host extends EventEmitter{
    constructor(id,port,options,autoConnect=false){
        super();
        this._id=id;
        this._port=port;
        this.__state=_hostState.Unknown;
        this._SysRdySender=new SysRdySender(_.get(config,'host.systemReadySignalSendSpan',[5000]),this.sendSysRdy.bind(this));
        this._SysRdySender.on('finish',()=>{
            this.setState(_hostState.SysReady,this.log('主机已工作在sysrdy状态'));
        });
        this.initOptions(options);
        this._serialport=new SerialPort(port,this._options);
        this._serialport.on(SerialPort.Events.Open,this._onPortOpen.bind(this));
        this._serialport.on(SerialPort.Events.Close,this._onPortClose.bind(this));
        this._serialport.on(SerialPort.Events.Error,this._onPortError.bind(this));
        this._serialport.on(SerialPort.Events.Data,this._onData.bind(this));
        this._serialport.on(SerialPort.Events.Online,this._onPortOnline.bind(this));
        this._serialport.on(SerialPort.Events.Offline,this._onPortOffline.bind(this));
        Parser(this,'host.js',{hid:id,port:port});
        if(autoConnect) this.connect();
    }

    initOptions(options){
        this._options={
            timeOut:3000,
            tryRecover:-1,
            recoverSpan:5000
        };
        _.extend(this._options,portOptions,options,{deDuplication:true,port:this._port});
    }

    _onData(data){
        let cmd = decode(data, this._id);
        switch(cmd.type){
            case _hostState.Error:
                this.setState(_hostState.Error,cmd);
                this._SysRdySender.interrupt();
                break;
            case _hostState.Normal:
                //第一次不用发送(unknown),其他两个状态来需要 补rdy状态
                if(this.state===_hostState.Alarm||this.state===_hostState.Error){
                    this._SysRdySender.send();
                    this.setState(_hostState.Normal,cmd);
                    return;
                }
                this.setState(this.state===_hostState.SysReady?_hostState.SysReady:_hostState.Normal,cmd);
                break;
            case _hostState.Alarm:
                this.setState(_hostState.Alarm,cmd);
                this._SysRdySender.interrupt();
                break;
        }
    }

    static get Events(){
        return _Events;
    }

    static get Errors() {
        return _Errors;
    }

    static get States(){
        return _hostState;
    }

    setState(state,params){
        if(state===this.__state) return;
        let stateOld=this.__state;
        this.__state=state;
        this.emit(_Events.StateChanged,this._log('主机状态改变',_.extend(params,{stateNew:state,stateOld:stateOld,type:_Events.StateChanged})));
    }

    get state(){
        return this.__state;
    }

    get id(){
        return this._id;
    }

    get isConnected() {
        return this._serialport.isConnected;
    }

    sendSysRdy(){
        if(!this.isConnected) return false;
        this._serialport.write(systemReady).then(()=>{
            this._log('向主机发送sysrdy信息成功');
        }).catch((e)=>{
            let error=this._error(_Errors.RdySignalsSendError,'sysrdy信号发送失败',e);
            this.emit(_Events.Error,error);
        });
        return true;
    }

    clearAlarm(){
        return new Promise((resolve,reject)=>{
            if(this.state!==_hostState.Alarm) return resolve(this.warn('客户端发来无效清除指令，已忽略'));
            this._serialport.write(reset).then(()=>{
                //this._bSendSysRdy=true;
                resolve(this._log('清除指令已发出'));
            }).catch((err)=>{
                reject(this._error(_Errors.writeError,'清除报警指令发送失败',{innerError:err}));
            });
        });
    }

    connect(){
        return this.disConnect().then(()=>{
            this._serialport.connect().catch(e=>e);
            return Promise.resolve();
        });
    }

    _onPortError(data){
        this.emit(_Events.Error,this._error(_HostErrors.PortError,'端口异常',data));
    }

    _onPortOpen(data){
        this.sendSysRdy();
        this.emit(_Events.Open,this._log('主机已连接',{innerEvent:data}));
    }

    _onPortClose(data){
        let log=this._log('主机连接关闭',{innerEvent:data});
        this.setState(_hostState.Unknown,log);
        this.emit(_Events.Close,log);
    }

    _onPortOnline(data){
        let log=this._log('主机重新连接上线',{innerEvent:data});
        this.emit(_Events.Online,log);
    }

    _onPortOffline(data){
        let log=this._log('主机断开，即将再次尝试重连',{innerEvent:data});
        this.setState(_hostState.Unknown,log);
        this.emit(_Events.Offline,log);
    }

    _log(desc,params){
        let id=(params&&'id' in params)?params['id']:sid(this._id);
        return this.log(desc,_.extend(params,{
            id:id
        }));
    }

    emit(event,params){
        _.extend(params,{type:event});
        return EventEmitter.prototype.emit.call(this,event,params);
    }

    _error(type,desc,innerError,params){
        return this.error(desc,_.extend({
            type: _Events.Error,
            errorType: type,
            innerError: innerError,
            id: sid(this._id)
        },params));
    }

    disConnect(){
        return this._serialport.disConnect();
    }
}

function decode(buf) {
    // important:
    // assume data length is 16
    // double  hex: 33 (dec: 51)  (16bit--hex: 33 33) is sync information from Security Terminal
    // After this sync information, the next 16 bit is the status information from Security Terminal
    // Program below is : detect sycn bit (Double hex 33) then read & record the status information from serial port of security terminal
    // because the data format in the serial port can be 33 33 ** ** or 33 33 33 ** or 33 * 33 33 33 *,
    // We need to detect 2 consecutive 33, not only one 33, and then record the real status information from security terminal
    let flag = 0,c1=0,c2=0;
    for (let i = 0; i < 15; i++)
    {
        if (flag === 0 && buf[i] !== 0x33)
        {
            flag = 1;
            continue;
        }
        if (flag === 1 && buf[i] === 0x33)
        {
            flag = 2;
            continue;
        }
        if (flag === 2 && buf[i] === 0x33)
        {
            flag = 3;
            continue;
        }
        if (flag === 3)
        {
            c1= buf[i];
            c2= buf[i + 1];
            break;
        }
    }

    if(c1===0&&c2===0){
        // fib optic connection error -> fatal error
        return {
            type:_hostState.Error,
            errorType:_Errors.ConnectError,
            desc:'收到主机无效指令'
        };
    }
    //0x33 0x33 0x55 0x15 0x00 0x00 0x00 0x00
    if (c1 === 0x55 && c2 === 0x15)
    {
        // system ready
        return {
            type:_hostState.Normal
        };
    }
    //0x33 0x33 0x01 0xC1 0x00 0x00 0x00 0x00
    //771米
    if ((c2 & 0xC0)===0xC0) {
        let  dis= ((c2 & 0xF) << 8) + c1;
        dis *= 3;
        return {
            type:_hostState.Alarm,
            position:dis
        };
    }
    //0x33 0x33 0x00 0x40 0x00 0x00 0x00 0x00
    //01000000
    if ((c2 & 0xC0)===0x40){
        // let dis=((c2 & 0xF) << 8) + c1;
        // dis = dis * 3 - 25; // meter
        // if (dis <= 50) dis = 50;
        return {
            type:_hostState.Error,
            errorType:_Errors.InitError,
            desc:'收到主机初始化异常指令'
        };
    }
}

let inc=0;
function sid(index) {
    let date = new Date();
    if(inc===10000) inc=0;
    return ('' + date.getFullYear()).slice(2)
        + _.padStart('' + (date.getMonth()+1), 2,'0')
        + _.padStart('' + date.getDate(), 2,'0')
        + _.padStart('' + date.getHours(), 2,'0')
        + _.padStart('' + date.getMinutes(), 2,'0')
        + _.padStart('' + date.getSeconds(), 2,'0')
        + _.padStart('' + index, 2,'0')
        +_.padStart(''+(inc++),4,0);
}

exports=module.exports=Host;