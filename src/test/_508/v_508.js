/**
 * Created by Luky on 2017/7/11.
 */

const VHost=require('./v_508');
const expect = require('chai').expect;
const SerialPort=require('serialport');
const _=require('lodash');
const assert=require('assert');

let options={
    "baudRate": 9600,
    "stopBits": 1,
    "dataBits": 8,
    autoOpen: false,
    parser:SerialPort.parsers.byteDelimiter([0xAF])
};

class _508PTZ{
    constructor(com){
        this._com=com;
    }
    run(cb){
        let port=this._port=new SerialPort(this._com,options);
        let buffer=[];
        function write(resp){
            port.write(resp,function(err){
                if(err) console.error(`508转台回执异常:${err},信息${resp.toString('hex')}`);
                console.log(`508转台回执成功,信息${Buffer.from(resp).toString('hex')}`);
            });
        }
        port.on('data',(data)=>{
            console.log(`[${Buffer.from(data).toString('hex')}]`);
            buffer=buffer.concat(data);
            while(true) {
                let i = 0;
                while (i < buffer.length && buffer[i] !== 0xA1 && buffer[i] !== 0xA2&&buffer[i] !== 0xFF) {
                    i++;
                }
                if(i>0)buffer=buffer.slice(i);
                if(buffer.length<9&&buffer[i]!==0xFF) return;
                if(buffer[i]===0xFF){
                    assert.ok(Buffer.from(buffer.slice(0,7)).equals(Buffer.from(new Buffer([0xFF,0x01,0x00,0x09,0x00,0x02,45]))));
                    buffer=buffer.slice(7);
                    console.log('自动聚焦回执');
                }

                if(buffer[0]===0xA1&&buffer.length>=0xF){
                    assert.equal(buffer[0xE],0xAF);

                    if(buffer[3]===0x50&&buffer[4]===0x32){
                        console.log('收到伺服移动指令');
                        let resp=new Buffer([0xA1,0x00,0x0B,0x45,0x60,0x00,0x00,0x00,0x00,0x00,0xAF]);
                        xor(resp,9);
                        write(resp);
                    }
                    buffer=buffer.slice(0xF);
                }

                if(buffer[0]===0xA1&&buffer.length>=0x0B) {
                    assert.equal(buffer[0xA],0xAF);

                    if(buffer[3]===0x50&&buffer[4]===0x30){
                        console.log('收到伺服移动指令');
                    }
                    else if(buffer[3]===0x51&&buffer[4]===0x52){
                        console.log('收到查询启动命令');
                    }
                    else if(buffer[3]===0x51&&buffer[4]===0x50){
                        console.log('收到查询位置命令');
                        let resp=new Buffer([0xA1,0x00,0x0B,0x30,0x58,0x00,0x00,0x00,0x01,0x00,0xAF]);
                        xor(resp,0x09);
                        let resp2=new Buffer([0xA1,0x00,0x0B,0x30,0x59,0x00,0x00,0x00,0x01,0x00,0xAF]);
                        xor(resp2,0x09);
                        write(Buffer.concat([resp,resp2],22));
                    }
                    buffer=buffer.slice(0xB);
                }

                if(buffer[i]===0xA2&&buffer.length>=9){
                    assert.equal(buffer[8],0xAF);
                    console.log(`收到白光命令${Buffer.from(buffer).toString('hex')}`);
                    let resp=buffer.slice(0,9);
                    resp[5]=0;resp[6]=0;
                    xor(resp,7);
                    write(resp);
                    buffer=buffer.slice(9);
                }
            }
        });
        port.open((err)=>{
            if(err){cb(err);console.error(`端口打开异常：${err}`);return;}
            cb();
            console.log('虚拟508设备已打开');
        });
    }
    stop(cb){
        this._port.close((err)=>{
            if(err){console.error(`端口关闭异常：${err}`);cb(err);return;}
            cb();
            console.log('虚拟508设备已关闭');
        });
    }
}

function xor(buffer,pos){
    let result=buffer[0];
    for(let x=1;x<pos;x++){
        result=result^buffer[x];
    }
    buffer[pos]=result;
}

exports=module.exports=_508PTZ;