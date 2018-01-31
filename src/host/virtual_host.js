const _ = require('lodash');
const SerialPort = require('../serialport/serialport');
const EventEmitter = require('events').EventEmitter;

const _options={
    baudRate: 115200,
    stopBits: 2,
    dataBits: 8,
    parity: 'none',
    byteLength: 1,
};

const cmds=[
    //正常指令
    new Buffer([0x00, 0x00, 0x00, 0x00, 0x00, 0x00,0x00,0x00,0x33,0x33,0x55,0x15,0x00,0x00,0x00,0x00]),
    //771米异常
    new Buffer([0x00, 0x00, 0x00, 0x00, 0x00, 0x00,0x00,0x00,0x33,0x33,0x01,0xC1,0x00,0x00,0x00,0x00]),
    //初始化异常
    new Buffer([0x00, 0x00, 0x00, 0x00, 0x00, 0x00,0x00,0x00,0x33,0x33,0x00,0x40,0x00,0x00,0x00,0x00]),
    //错误指令
    new Buffer([0x00, 0x00, 0x00, 0x00, 0x00, 0x00,0x00,0x00,0x33,0x30,0x00,0x00,0x00,0x00,0x00,0x00])
];

const _cmd={
  normal:'normal',alarm:'alarm'
};

const _normalCmd=cmds[0];
const _alarmCmd=Buffer.from([0x00, 0x00, 0x00, 0x00, 0x00, 0x00,0x00,0x00,0x33,0x33,0x00,0xC0,0x00,0x00,0x00,0x00]);

class VirtualHost extends EventEmitter{
    constructor(port){
        super();
        this._port=port;
        this._serialPort=new SerialPort(port,_options);
        this._serialPort.on('data',this._onData.bind(this));
        this._timeHandle=0;
        this._state='ready';
        console.log(`|||||||||||||||||||||||||||||||||||||host ${this._port} state normal`);
    }

    static get portOptions(){
        return _options;
    }

    static get cmds(){
        return cmds;
    }

    static get nomalCmd(){
        return cmds[0];
    }

    _onData(data){
        if(data[0]===0xAA){
            this.emit('reset',{port:this._port});
            console.log(`|||||||||||||||||||||||||||||||||||||host ${this._port}  state reseted`);
            this._state='reset';
            clearTimeout(this._timeHandle);
            this.send(_cmd.normal);
            return;
        }
        if(data[0]===0){
            this.emit('ready',{port:this._port});
            this._state='ready';
            console.log(`|||||||||||||||||||||||||||||||||||||host ${this._port} state sys rdy`);
        }
    }

    static AlarmCmd(postion){
        let cmdnew=Buffer.from(_alarmCmd);
        let p=Math.floor(postion/3);
        cmdnew[10]=p&0xFF;
        cmdnew[11]+=(p>>8)&0xF;
        return cmdnew;
    }

    static get CMD(){
        return _cmd;
    }

    start(){
        return this._serialPort.connect();
    }

    send(cmdname,postion,logout=true){
        clearTimeout(this._timeHandle);
        if(cmdname===_cmd.normal){
            this._serialPort.write(_normalCmd);
            this._timeHandle=setTimeout(this.send.bind(this,cmdname,postion),250);
            return;
        }
        if(cmdname===_cmd.alarm){
            let cmdnew=Buffer.from(_alarmCmd);
            let p=Math.floor(postion/3);
            cmdnew[10]=p&0xFF;
            cmdnew[11]+=(p>>8)&0xF;
            this._serialPort.write(cmdnew).then(()=>{
                if(logout){
                    this._state='alarm';
                    console.log(`|||||||||||||||||||||||||||||||||||||host ${this._port} state alarm,cmd ${cmdnew.toString('hex')}`);
                }
            });
            this._timeHandle=setTimeout(this.send.bind(this,cmdname,postion,false),250);
            return;
        }
        throw new Error(`unknow cmd ${cmdname}`);
    }

    stop(){
        return this._serialPort.disConnect();
    }
}


exports=module.exports=VirtualHost;