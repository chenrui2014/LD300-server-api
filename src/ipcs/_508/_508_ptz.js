/**
 * Created by Luky on 2017/7/5.
 */

const PTZ=require('../base/ptz');
const _=require('lodash');
//const Buffer=require('buffer');
const config=global.server_config||require('../../config/config');
const ser_option=config.getConfig('_508_config.json');
const SerialPort = require('serialport');
const assert=require('assert');

const workType={
    'chaxun':1,
    'dangan':2,//单杆，用于移动
    'yindao':3,//引导，定点移动
    'shaomiao':4
};

//不用要及时关闭
class _508 extends PTZ{
    constructor(options){
        super();
        _.each({'ser_port':''},(val,key)=>{this.options[key]=options[key]||val;});
        _.each({
            'focus_speed':ser_option['focusSpeed'],
            'h_speed':ser_option['hSpeed'],
            'v_speed':ser_option['vSpeed'],
            'auto_close':ser_option['autoClose']
        },(val,key)=>{this[key]=options[key]||val;});
        this.ser_options=_.defaults(this.options.COM||{},{
            'baudRate': 9600,
            'stopBits': 1,
            'dataBits': 8,
            'parity':'none',
            'cmdDelay':6000,
            'autoOpen': false,
            parser:SerialPort.parsers.byteDelimiter([0xAF])
        },ser_option['COM']);
        this.focus_speed=_.clamp(this.focus_speed,0x32,0xFA);
        this.h_speed=_.clamp(this.h_speed,1,6000);
        this.v_speed=_.clamp(this.v_speed,1,6000);
        this._connected=false;
        this._port = new SerialPort(this.options.ser_port, this.ser_options);
        this._resp=[];
        this._respExpect=[];
        this._x=-1;this._y=-1;this._z=0;
        this._stopcmd=null;
        this._stopcmdresp=null;
        this._servo_worktype=0;
        this.auto_colse_handle=_.bind(this.disConnect,this);
    }
    get isConnected(){
        return this._connected;
    }
    //由于是公用的串口，使用完需要立刻关闭，所以外部调用测试通过后需要立即关闭
    connect(closeImmediately=true){
        let _this=this;
        return new Promise((resolve,reject)=>{
            if(this.isConnected){
                resolve();
                return;
            }

            let recv=function(buffer){
                //增加超时自动关闭端口
                _.throttle(_this.auto_colse_handle,_this.auto_close);
                let resp=_this._resp=_this._resp.concat(buffer);
                while(true){
                    let i=0;
                    while(i<resp.length&&resp[i]!==0xA1&&resp[i]!==0xA2){
                        i++;
                    }
                    if(i>0)resp=_this._resp=resp.slice(i);
                    if(resp.length<9) return;

                    if(resp[0]===0xA1&&resp.length>=11){//伺服命令
                        assert.equal(resp[10],0xAF);
                        if(resp[3]===0x30&&resp[4]===0x58){//查询位置x返回
                            _this._x=bytes2Int(resp,5)*0.0001;
                        }
                        if(resp[3]===0x30&&resp[4]===0x59){//查询位置y返回
                            _this._y=bytes2Int(resp,5)*0.0001;
                        }
                        if(resp[3]===0x45&&resp[4]===0x60){
                            //伺服停止命令
                        }
                        /*               if(resp[3]===0x45&&resp[4]===0x50){
                         //扫描模式下，到达扫描点以后会停下来，这个时候需要将焦距移动到预设位置
                         }*/
                        if(_this._respExpect.length){
                            let expect=_this._respExpect[0];
                            if(expect.cmd[0]===resp[3]&&expect.cmd[1]===resp[4]){
                                _this._respExpect.shift();
                                expect.resolve();
                            }
                        }
                        resp=_this._resp=resp.slice(11);
                    }

                    if(resp[0]===0xA2&&resp.length>=9){//白光命令
                        assert.equal(resp[8],0xAF);
                        if(resp[3]===0x56&&resp[4]===0x53){//zoom stop response
                            _this._z=bytes2Int(resp,5);
                            _this._focusAuto();
                        }
                        if(resp[3]===0x50&&resp[4]===0x41){//正比例镜头预置点
                            _this._z=bytes2Int(resp,5);
                        }
                        if(_this._respExpect.length){
                            let expect=_this._respExpect.shift();
                            if(expect.cmd[0]===resp[3]&&expect.cmd[1]===resp[4]){
                                _this._respExpect.shift();
                                expect.resolve();
                            }
                        }
                        resp=_this._resp=resp.slice(9);
                    }
                }
            };

            let err_recv=function(err){
                console.error(err);
            };

            _this._port.open((err) => {
                if (err) {reject(err);return;}
                if(closeImmediately){
                    _this._port.close((err)=>{
                        err?reject(err):resolve();
                    });
                    return;
                }
                this._connected=true;
                _this._port.on('data',recv);
                _this._port.on('err',err_recv);
                _this._port.on('close',(err)=>{
                    _this._port.removeListener('data',recv);
                    _this._port.removeListener('err',err_recv);
                });
                resolve();
            });
        });
    }
    disConnect(){
        let _this=this;
        return new Promise((resolve,reject)=>{
            if(!_this.isConnected) resolve();
            _this._port.close((err)=>{
                if(err){
                    reject(err);
                    return;
                }
                _this._connected=false;
                resolve();
            });
        });
    }

    _setStopCmd(cmd,resp){
        this._stopcmd=cmd;
        this._stopcmdresp=resp;
    }

    _setRespCmd(cmd,resolve,reject){
        this._respExpect.push({cmd:cmd,resolve:resolve,reject:reject});
    }

    _sendCmd(req,resp=null,stop=null,stopresp=null){
        let _this=this;
        return this.connect(false).then(()=>{
            return new Promise((resolve,reject)=>{
                _this._port.write(req,(err)=>{
                    if(err) {reject(err);return;}
                    if(stop){
                        _this._setStopCmd(stop,stopresp);
                    }
                    if(resp){
                        _this._setRespCmd(resp,resolve,reject);
                        setTimeout(()=>{
                            reject(`request timeout`);
                        },_this.ser_options.cmdDelay);
                    }
                    else resolve();
                });
            });
        });
    }

    //镜头
    _lens(cmd,stopcmd=null,p1=0,p2=0){
        let req=A20009(cmd[0],cmd[1],p1,p2);
        stopcmd=stopcmd&&A20009(stopcmd[0],stopcmd[1]);
        return this._sendCmd(req,req.slice(3,5),
            stopcmd,
            stopcmd&&stopcmd.slice(3,5)
        );
    }

    ptzStop(){
        if(this.stopcmd){
            let stop=this.stopcmd,stopr=this._stopcmdresp;
            this._stopcmdresp=this.stopcmd=null;
            return this._sendCmd(stop,stopr);
        }
        return new Promise((resolve)=>{
            resolve();
        });
    }
    zoomAdd() {
        return this._lens([0x56,0x41],[0x56,0x53]);
    }
    zoomDec() {
        return this._lens([0x56,0x4D],[0x56,0x53]);
    }

    _zoomStop(){
        return this._lens([0x56,0x53]);
    }

    _zoomTo(z){
        //停止命令不确定有
        return this._lens([0x50,0x41],null,z&0xFF,(z>>8)&0xFF);
    }

    focusAdd() {
        return this._lens([0x46,0x41],[0x46,0x53],this.focus_speed);
    }
    focusDec() {
        return this._lens([0x46,0x4D],[0x46,0x53]);
    }
    _focusAuto() {
        //FF开头的是Pelco-D协议 富士能白光自动聚焦
        let cmd=new Buffer([0xFF,0x01,0x00,0x09,0x00,0x02,0/*,0xAF*/]);
        xor(cmd,6);cmd[6]=cmd[6]%100;
        return this._sendCmd(cmd);
    }
    apertureAdd() {
        return this._lens([0x49,0x41],[0x49,0x53]);
    }
    apertureDec() {
        return this._lens([0x49,0x4D],[0x49,0x53]);
    }

    move(direction){
        let x=0,y=0;
        if(direction&PTZ.Directions.left){
            x=-this.h_speed;
        }
        if(direction&PTZ.Directions.right){
            x=this.h_speed
        }
        if(direction&PTZ.Directions.up){
            y=this.v_speed;
        }
        if(direction&PTZ.Directions.down){
            y=-this.v_speed;
        }

        //11
        let req=new Buffer([0xA1,0x00,0x0B,0x4D,0x58,(x>>8)&0xFF,x&0xFF,(y>>8)&0xFF,y&0xFF,0,0xAF]);
        xor(req,9);
        let stopcmd=this.stopcmd=new Buffer([0xA1,0x00,0x0B,0x4D,0x58,0,0,0,0,0,0xAF]);
        xor(stopcmd,9);
        return this._sendCmd(req,null,stopcmd);
    }

    getPoint(){
        let _this=this;
        return this._zoomStop().then(()=>{
            return _this._sendCmd(A1000B(0x51,0x52,0x00)).then(()=>{//启动上传
                let promiseX=new Promise((resolve,reject)=>{_this._setRespCmd([0x30,0x58],resolve,reject);});
                let promiseY=new Promise((resolve,reject)=>{_this._setRespCmd([0x30,0x59],resolve,reject);});
                return _this._sendCmd(A1000B(0x51,0x50,0x00)).then(()=>{//查询
                    return Promise.all([promiseX,promiseY]).then(()=>{
                        return new Promise((resolve)=>{
                            resolve({
                                x:_this._x,
                                y:_this._y,
                                z:_this._z
                            });
                        });
                    });
                });
            });
        });
    }
    moveToPoint(x,y,z){
        x*=100;y*=100;z=_.toInteger(z);
        let req=A1000F(0x50,0x32,x,y);
        let req2=A1000B(0x50,0x30,0x00);//预置位导航命令信息同步
        let _this=this;
        return new Promise((resolve,reject)=>{
            let p1=_this._sendCmd(req,[0x45,0x60]);
            let p2=new Promise((resolve,reject)=>{
                setTimeout(()=>{
                    _this._sendCmd(req2).then(resolve).catch(reject);
                },200);
            });
            let p3=new Promise((resolve,reject)=>{
                setTimeout(()=>{
                    _this._zoomTo(z).then(resolve).catch(reject);
                },450);
            });
            return Promise.all([p1,p2,p3]).then(()=>{
                _this._focusAuto();
                resolve();
            }).catch(reject);
        });
    }

    moveToPreset(preset){
        return this.moveToPoint(preset.x,preset.y,preset.z);
    }
    setPreset(name){throw new Error('未实现函数setPreset');}
    getPresets(){throw new Error('未实现函数getPresets');}
    removePoint(name){throw new Error('未实现函数removePoint');}
}


function bytes2Int(buffer,offset){
    return ((buffer[offset] & 0xFF)
        | ((buffer[offset + 1] & 0xFF) << 8)
        | ((buffer[offset + 2] & 0xFF) << 16)
        | ((buffer[offset + 3] & 0xFF) << 24));
}

function xor(buffer,pos){
    let result=buffer[0];
    for(let x=1;x<pos;x++){
        result=result^buffer[x];
    }
    buffer[pos]=result;
}

function A20009(ctrl1,ctrl2,data1=0,data2=0){
    let req=Buffer.from([0xA2,0x00,0x09,ctrl1,ctrl2,data1,data2,0,0xAF]);
    xor(req,7);
    return req;
}

function A1000F(ctrl1,ctrl2,data1,data2) {
    let req=new Buffer([0xA1,0x00,0x0F,ctrl1,ctrl2,
        (data1>>24)&0xFF,(data1>>16)&0xFF,(data1>>8)&0xFF,data1&0xFF,
        (data2>>24)&0xFF,(data2>>16)&0xFF,(data2>>8)&0xFF,data2&0xFF,
        0,0xAF]);
    xor(req,13);
    return req;
}

function A1000B(ctrl1,ctrl2,data){
    let req=new Buffer([0xA1,0x00,0x0B,ctrl1,ctrl2,
        (data>>24)&0xFF,(data>>16)&0xFF,(data>>8)&0xFF,data&0xFF,
        0,0xAF]);
    xor(req,9);
    return req;
}

exports=module.exports=_508;