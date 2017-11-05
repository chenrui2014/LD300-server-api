
const flv=require('../../app/flv/flv_encoder');
const WebSocket = require('ws');
const _=require('lodash');
const url=require('url');
const assert=require('assert');
const Writable=require('stream').Writable;
const H264unPack=require('../../app/ipcs/dahua/_dh_h264_unpack');
const lineReader = require('line-reader');
const path=require('path');
const fs = require('fs');
//const H264_2FLV=require('../app/h264/h264_2flv');
const Cache=require('../../app/servers/cache/to_flv_cache');

const wOption = {
    flags: 'w',
    encoding: null,
    fd: null,
    mode: 0o666,
    autoClose: false
};
class Live{
    constructor(done){
        this._port=3000;
        this._path='/live';
        this._open();
        this._rooms=[];
        this.done=done;
    }

    _open(){
        let socket=this._server=new WebSocket.Server({
            port:this._port,
            //path:this._path,
            noServer:true,
            verifyClient:(info)=>{
                console.log(info);
                return true;
            }
        });
        socket.on('connection', (ws, req) => {
            const uri = url.parse(req.url, true);
            console.log(`客户端连入，url${req.url}`);
            const roomIDRegExp = new RegExp(`${this._path}\\/(\\d+)`, 'i');
            const ipcid = _.last(roomIDRegExp.exec(uri.path) || [-1]) - 0;
            const user = uri.query.id;
            ws.on('message', (msg) => {
                console.log(`收到客户端消息${msg}`);
            });
            ws.on('close', (code, reason) => {
                console.log(`Websocket连接关闭code:${code},reason${reason}，ipcid:${ipcid},user:${user}`);
            });

            if (ws.readyState === WebSocket.OPEN) {
                //let lfv=new H264_2FLV();
                //lfv.open();
                let cache=new Cache();
                cache.addClient((data)=>{
                    ws.send(data);
                });
                const fp=path.resolve(__dirname,`data/dh_h264_cb.txt`);
                //let fw2=fs.createWriteStream(`d:/dhipc_unpacked_2flv.flv`,wOption);
                let unpack=new H264unPack(true);
                unpack.pipe(cache);//.pipe(fw2);
                lineReader.eachLine(fp, function(line, last) {
                    unpack.write(Buffer.from(line,'hex'));
                    //console.log(line);
                    if (last) {
                        unpack.end();
                        //fw2.close();
                    }
                });
                //fw2.on('finsih',this.done);
                cache.on('finsih',this.done);
                //server.on('finsih',done);
            }
        });
    }
}

describe('h264_2flv',()=>{
    it('转FLV文件',(done)=>{
        let server=new Live(done);
    });

});

xdescribe('flv-script部分',()=>{
   it('参看',()=>{
       const data='00086475726174696f6e000000000000000000000577696474680040760000000000000006686569676874004072000000000000000d766964656f646174617261746500000000000000000000096672616d6572617465004059000000000000000c766964656f636f646563696400401c00000000000000057469746c65020010525453502053657373696f6e2f322e300007656e636f64657202000d4c61766635372e37352e313030000866696c6573697a65000000000000000000000009';
       console.log(Buffer.from(data,'hex').toString('utf8'));
   });
});

xdescribe('FLVEncoder',()=>{
    it('没关系，固定值获取下看看',()=>{
        let x=flv.VedioTagAVCPackage_EndOfSequence().toString('hex');
        console.log(x);
        //0900000400000000000000020000000000000f
    });
});