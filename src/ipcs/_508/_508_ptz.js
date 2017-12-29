/**
 * Created by Luky on 2017/7/5.
 */

const PTZ=require('../base/ptz');
const _=require('lodash');
const globalConfig=global.server_config||require('../../config/config');
const config=globalConfig.getConfig('_508_config');
const SerialPort = require('serialport');
//const ByteLength = SerialPort.parsers.ByteLength;
//const Delimiter = SerialPort.parsers.Delimiter;
const Delimiter = require('./Delimiter');
const assert=require('assert');
const {Parser} =require('../../log/log');
const isLittleEndian = require('utils-is-little-endian');

/*
const workType={
    'chaxun':1,
    'dangan':2,//单杆，用于移动
    'yindao':3,//引导，定点移动
    'shaomiao':4
};*/

//不用要及时关闭
class _508 extends PTZ{
    constructor(options){
        super();
        _.each({'port':''},(val,key)=>{this[key]=options[key]||val;});
        _.each({
            'focus_speed':config['focusSpeed']
            ,'h_speed':config['hSpeed']
            ,'v_speed':config['vSpeed']
            ,'stopCmdDelay':config['stopCmdDelay']
            ,'auto_close':(config['autoClose']||60000)
        },(val,key)=>{this[key]=(key in options)?options[key]:val;});
        this.options=_.defaults(this.options.serialPort||{},config.options,{
            'baudRate': 9600,
            'stopBits': 1,
            'dataBits': 8,
            'parity':'none',
            'cmdDelay':6000,
            'autoOpen': false
        });
        this.focus_speed=_.clamp(this.focus_speed,0x32,0xFA);
        this.h_speed=_.clamp(this.h_speed,1,6000);
        this.v_speed=_.clamp(this.v_speed,1,6000);
        this._connected=false;
        this._resp=Buffer.alloc(0);
        this._respExpect=[];
        this._x=-1;this._y=-1;this._z=0;
        this._cmdStop=null;
        this._cmdStopResp=null;
        //this._servo_worktype=0;
        Parser(this,'_508_ptz.js',{port:this.port});
    }

    //由于是公用的串口，使用完需要立刻关闭，所以外部调用测试通过后需要立即关闭
    async _connect(){
        return new Promise((resolve,reject)=>{
            let port = new SerialPort(this.port, this.options);
            let receive=(buffer)=>{
                let resp=this._resp=Buffer.concat([this._resp,buffer]);
                while(true){
                    let i=0;
                    while(i<resp.length&&resp[i]!==0xA1&&resp[i]!==0xA2){
                        i++;
                    }
                    if(i>0)resp=this._resp=resp.slice(i);
                    if(resp.length<9) return;

                    if(resp[0]===0xA1&&resp.length>=11){//伺服命令
                        assert.equal(resp[10],0xAF);
                        if(resp[3]===0x30&&resp[4]===0x58){//查询位置x返回
                            //低位在前
                            this._x=resp.readInt32LE(5)*0.0001;
                        }
                        if(resp[3]===0x30&&resp[4]===0x59){//查询位置y返回
                            this._y=resp.readInt32LE(5)*0.0001;
                        }
                        if(resp[3]===0x45&&resp[4]===0x60){
                            //伺服停止命令
                        }
                        /*               if(resp[3]===0x45&&resp[4]===0x50){
                         //扫描模式下，到达扫描点以后会停下来，这个时候需要将焦距移动到预设位置
                         }*/
                        if(this._respExpect.length){
                            let expect=this._respExpect[0];
                            if(expect.cmd[0]===resp[3]&&expect.cmd[1]===resp[4]){
                                this._respExpect.shift();
                                expect.resolve();
                            }
                        }
                        resp=this._resp=resp.slice(11);
                    }

                    if(resp[0]===0xA2&&resp.length>=9){//白光命令
                        assert.equal(resp[8],0xAF);
                        if(resp[3]===0x56&&resp[4]===0x53){//zoom stop response
                            this._z=(isLittleEndian?resp.readInt16LE(5):resp.readInt16BE(5));
                        }
                        if(resp[3]===0x50&&resp[4]===0x41){//正比例镜头预置点
                            this._z=(isLittleEndian?resp.readInt16LE(5):resp.readInt16BE(5));
                            this._focusAuto();
                        }
                        if(this._respExpect.length){
                            let expect=this._respExpect.shift();
                            if(expect.cmd[0]===resp[3]&&expect.cmd[1]===resp[4]){
                                this._respExpect.shift();
                                expect.resolve();
                            }
                        }
                        resp=this._resp=resp.slice(9);
                    }
                }
            };

            port.on('close', (e) => {
                //file.close();
                //网线拔掉以后会有关闭事件
                port.removeAllListeners();
                if(this.serialPort) delete this.serialPort;
                port=null;
                e?this.emit('error',this.error("508转台端口关闭",{innerError:(e||e.toString())}))
                :this.log("508转台端口关闭");
            });

            port.on('error', (err) => {
                this.emit('error',this.error("508转台端口未知异常",{innerError:err.toString()}));
                this.disConnect();
            });

            port.open((e) =>{
                if (e) {
                    port.removeAllListeners();
                    return reject(e);
                }
                this.setConnected();
                this.log("508转台端口已连接");
                this.serialPort=port;
                //const parser = port.pipe(new ByteLength({length: 9}));
                //const parser = port.pipe(new Delimiter());
                port.on('data', receive);
                resolve();
            });
        });
    }

    async _disConnect(){
        return new Promise((resolve,reject)=>{
            if(this.serialPort){
                let port=this.serialPort;this.serialPort=null;
                port.close((err=>{
                    if(err){reject(err);return;}
                    resolve();
                }));
                return;
            }
            resolve();
        });
    }

    _setStopCmd(cmd,resp){
        this._cmdStop=cmd;
        this._cmdStopResp=resp;
    }

    _setRespCmd(cmd,resolve,reject){
        this._respExpect.push({cmd:cmd,resolve:resolve,reject:reject});
    }

    async _sendCmd(name,req,resp=null){
        return new Promise((resolve,reject)=>{
            this.log(`向转台发送命令${name}`,{cmd:req.toString('hex')});
            this.serialPort.write(req,'binary',(err)=>{
                if(err) return reject(err);
                if(resp) this._setRespCmd(resp,resolve,reject);
                else resolve();
            });
        });
    }

    //镜头
    async _lens(name,req,cmdStop=null,stop=false){
        await this.connect();
        await this._sendCmd(name,req,req.slice(3,5));
        if(cmdStop){
            if(!stop){
                this._setStopCmd(cmdStop,cmdStop.slice(3,5));
            }
            else{
                await this._ptzStop(cmdStop,cmdStop.slice(3,5));
            }
        }
        this.disConnectDelay();
    }

    disConnectDelay(){
        setTimeout(()=>{
            this.disConnect();
        },this.auto_close)
    }

    async _ptzStop(cmd,resp){
        await this.connect();
        await this._sendCmd('ptzStop',cmd,resp);
        await this.disConnectDelay();
    }

    async ptzStop(){
        if(this._cmdStop){
            let stop=this._cmdStop,respCmdStop=this._cmdStopResp;
            this._cmdStopResp=this._cmdStop=null;
            await this.ptzStop(stop,respCmdStop);
        }
    }

    async zoomAdd(stop) {
        let cmd=A20009(0x56,0x41);
        await this._lens('zoomAdd',cmd,A20009(0x56,0x53),!!stop);
        return cmd;
    }

    async zoomDec(stop) {
        let cmd=A20009(0x56,0x4D);
        await this._lens('zoomDec',cmd,A20009(0x56,0x53),!!stop);
        return cmd;
    }

    async _zoomStop(){
        let cmd=A20009(0x56,0x53);
        await this._lens('zoomStop',cmd);
        return cmd;
    }

    async _zoomTo(z){
        //停止命令不确定有
        let cmd=A20009(0x50,0x41,z&0xFF,(z>>8)&0xFF);
        await this._lens('zoomTo',cmd);
        return cmd;
    }

    async focusAdd(stop) {
        let cmd=A20009(0x46,0x41,this.focus_speed);
        await this._lens('focusAdd',cmd,A20009(0x46,0x53),!!stop);
        return cmd;
    }

    async focusDec(stop) {
        let cmd=A20009(0x46,0x4D);
        await this._lens('focusDec',cmd,A20009(0x46,0x53),!!stop);
        return cmd;
    }

    async _focusStop(){
        let cmd=A20009(0x46,0x53);
        await this._lens('focusStop',cmd);
        return cmd;
    }

    async _focusAuto() {
        //FF开头的是Pelco-D协议 富士能白光自动聚焦
        let cmd=new Buffer([0xFF,0x01,0x00,0x09,0x00,0x02,0/*,0xAF*/]);
        xor(cmd,6);cmd[6]=cmd[6]%100;
        await this.connect();
        await this._sendCmd('focusAuto',cmd).then(()=>{}).catch(()=>{});
        this.disConnectDelay();
    }

    async apertureAdd(stop) {
        let cmd=A20009(0x49,0x41);
        await this._lens('apertureAdd',cmd,A20009(0x49,0x53),!!stop);
        return cmd;
    }

    async apertureDec(stop) {
        let cmd=A20009(0x49,0x4D);
        await this._lens('apertureDec',cmd,A20009(0x49,0x53),!!stop);
        return cmd;
    }

    async _apertureStop() {
        let cmd=A20009(0x49,0x53);
        await this._lens('apertureStop',cmd);
        return cmd;
    }

    async move(direction,stop){
        let x=0,y=0;
        if((direction&PTZ.Directions.left)>0){
            x=-this.h_speed;
        }
        else if((direction&PTZ.Directions.right)>0){
            x=this.h_speed
        }
        if((direction&PTZ.Directions.top)>0){
            y=this.v_speed;
        }
        else if((direction&PTZ.Directions.down)>0){
            y=-this.v_speed;
        }

        //11
        let req=new Buffer([0xA1,0x00,0x0B,0x4D,0x58,(x>>8)&0xFF,x&0xFF,(y>>8)&0xFF,y&0xFF,0,0xAF]);
        xor(req,9);
        let cmdStop=this._cmdStop=new Buffer([0xA1,0x00,0x0B,0x4D,0x58,0,0,0,0,0,0xAF]);
        xor(cmdStop,9);
        await this.connect();
        await this._sendCmd('move',req,null);
        if(!stop){
            this._setStopCmd(cmdStop);
        }
        else{
            await this._ptzStop(cmdStop);
        }
        this.disConnectDelay();
        return req;
    }

    async getPoint(){
        await this.connect();
        await this._zoomStop();
        //启动上传功能，防止没有启动照成无法找到数据
        await this._sendCmd('getPoint-startup',A1000B(0x51,0x52,0x00));
        let promiseX=new Promise((resolve,reject)=>{this._setRespCmd([0x30,0x58],resolve,reject);});
        let promiseY=new Promise((resolve,reject)=>{this._setRespCmd([0x30,0x59],resolve,reject);});
        let promiseZ=new Promise((resolve,reject)=>{this._setRespCmd([0x56,0x53],resolve,reject);});
        //查询
        await Promise.all([
            this._sendCmd('getPoint-xy',A1000B(0x51,0x50,0x00)),
            this._sendCmd('getPoint-z-zoomStop',A20009(0x56,0x53))
        ]);
        await Promise.all([promiseX,promiseY,promiseZ]);
        this.disConnectDelay();
        return {x:this._x,y:this._y,z:this._z};
    }

    async moveToPoint(x,y,z){
        x*=100;y*=100;z=_.toInteger(z);
        let req=A1000F(0x50,0x32,x,y);
        let req2=A1000B(0x50,0x30,0x00);//预置位导航命令信息同步
        await this.connect();
        let p1=this._sendCmd('moveToPoint-1',req,[0x45,0x60]);
        let p2=new Promise((resolve,reject)=>{
            setTimeout(()=>{
                this._sendCmd('moveToPoint-2',req2).then(resolve).catch(reject);
            },200);
        });
        let p3=new Promise((resolve,reject)=>{
            setTimeout(()=>{
                this._zoomTo(z).then(resolve).catch(reject);
            },450);
        });
        await Promise.all([p1,p2,p3]);
        this._focusAuto();
        this.disConnectDelay();
    }

    /*async moveToPreset(preset){
        return await this.moveToPoint(preset.x,preset.y,preset.z);
    }
    setPreset(name){throw new Error('未实现函数setPreset');}
    getPresets(){throw new Error('未实现函数getPresets');}
    removePoint(name){throw new Error('未实现函数removePoint');}
    */
}

function xor(buffer,pos){
    let result=buffer[0];
    for(let x=1;x<pos;x++){
        result=result^buffer[x];
    }
    buffer[pos]=result;
    return buffer;
}

function A20009(ctrl1,ctrl2,data1=0,data2=0){
    let req=Buffer.from([0xA2,0x00,0x09,ctrl1,ctrl2,data1,data2,0,0xAF]);
    return xor(req,7);
}

function A1000F(ctrl1,ctrl2,data1,data2) {
    let req=new Buffer([0xA1,0x00,0x0F,ctrl1,ctrl2,
        (data1>>24)&0xFF,(data1>>16)&0xFF,(data1>>8)&0xFF,data1&0xFF,
        (data2>>24)&0xFF,(data2>>16)&0xFF,(data2>>8)&0xFF,data2&0xFF,
        0,0xAF]);
    return xor(req,13);
}

function A1000B(ctrl1,ctrl2,data){
    let req=new Buffer([0xA1,0x00,0x0B,ctrl1,ctrl2,
        (data>>24)&0xFF,(data>>16)&0xFF,(data>>8)&0xFF,data&0xFF,
        0,0xAF]);
    return xor(req,9);
}

exports=module.exports=_508;