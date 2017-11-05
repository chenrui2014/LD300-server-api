require('../modify_config');
const H264unPack=require('../../app/ipcs/dahua/_dh_h264_unpack');
const lineReader = require('line-reader');
const path=require('path');
const fs = require('fs');
const H264_2FLV=require('../../app/servers/cache/_h264_2flv');
const IPCFactory=require('../../app/servers/ipc_factory');
const dhlib=require('../../app/ipcs/dahua/dhnetsdk');
const AAC=require('../../app/acc/acc_adts_parser');

const wOption = {
    flags: 'w',
    encoding: null,
    fd: null,
    mode: 0o666,
    autoClose: false
};

describe('大华h264视频回调数据解包测试',()=>{

    function  file(houzui,done) {
        const fp=path.resolve(__dirname,`data/dh_h264_cb${houzui}.txt`);
        let fw2=fs.createWriteStream(`d:/dhipc_unpacked${houzui}.dat`,wOption);
        let unpack=new H264unPack();
        lineReader.eachLine(fp, function(line, last) {
            //console.log(line);
            unpack._transform(Buffer.from(line,'hex'),null,(err,data)=>{
                if(null!=data){
                    //console.log(data.toString('hex'));
                    fw2.write(data);
                    const from=(data[2]===1?3:4);
                    console.log(JSON.stringify(decode.parseNAL(data.slice(from))));
                }
            });
            //console.log(line);
            if (last) {
                fw2.close();
                done();
            }
        });
    }

    it('大华头部解析',()=>{
        //08 0001 0010 00000 0803e 0000
        let s='f0000000ae66080052010000b2952e465a0e10b583011a028855aeb2e300000096010000fff16c40245ffc010c9ffd8a256dc2a4aa629552a58bc29171e42296253510deef8f2d097def77f75278887c40ff541c252d56a95e5cbb2a3a9c0a99a89f1bae38e55d6bc6aace3a9f2d815836a818ddbe660a048790008520c1be4af9431d8a07399d014a5865dd4dd7a5208a41400214ad41dae1ae43601025a1d4205680272b40e401283bc5842dbe58db215b901595de8f3891f412021a40542fb60829b460c2f9c4670b02ea3667532b805e2aa04c978a5ae77e0295085006406340e7302900502f3380124e688ee4235105f0220c628703605f7c02de62c2919d223bc78d0dc2f29e5180a58e9eeadf7e26d55d3ea6e7584b9bba5b4eefdfaed7576691be81dd13b83514c0062bafa00dd632070bdfc40e535b035d5800e8f1e802b8b981c06468617652010000';
        /*let x=new dhlib.structs.NET_TIME_EX({
            dwYear:2017,// 年
            dwMonth:8,// 月
            dwDay:23,// 日
            dwHour:0,// 时
            dwMinute:23,// 分
            dwSecond:0,// 秒
            dwMillisecond:0,// 毫秒
        });
        console.log(x.ref().toString('hex'));
        */
        let buf=Buffer.from(s,'hex');
        let buf2=buf.slice(36);
        let ainfo=AAC.ParseADTSHeader(buf2);
        console.log(ainfo);
        let af=new dhlib.structs.AUDIO_FORMAT({
            byFormatTag:8,
            nChannels:1,
            wBitsPerSample:16,
            nSamplesPerSec:16000
        });
        console.log(af.ref().toString('hex'));
        /*let buf=Buffer.from(s,'hex');
        console.log(`结构体NET_FRAME_INFO_EX长度${dhlib.structs.FRAME_INFO_EX.size}`);
        let frameInfo=new dhlib.structs.FRAME_INFO_EX(buf);
        console.log(`结构体NET_FRAME_INFO_EX长度${dhlib.structs.NET_FRAME_INFO_EX.size}`);
        let frameInfo2=new dhlib.structs.NET_FRAME_INFO_EX(buf);
        console.log(frameInfo.inspect());*/
    });
    xit('大华h264视频回调数据解包测试',(done)=>{
        file('',done);
    });
    xit('大华h264视频回调数据解包测试_fps10',(done)=>{
        file('_fps10',done);
    });

    async  function ipc(id,done) {
        const fp=fs.createWriteStream(`d:/dhsdk_unpacked${id}.txt`,wOption);
        let fw2=fs.createWriteStream(`d:/dhsdk_unpacked${id}.dat`,wOption);
        let ipc=await IPCFactory.getIPC(id);
        ipc.play();
        ipc.on('data',(data)=>{
            fw2.write(Buffer.concat([Buffer.from([0,0,0,1]),data.d],4+data.d.length));
            fp.write(data.d.toString('hex')+'\r\n');
        });
        setTimeout(()=>{
            fw2.close();
            fp.close();
            done();
        },15000);
    }

    it('球机图像',(done)=>{
        ipc(4,done);
    });

    xit('枪机图像',(done)=>{
        ipc(1,done);
    });

});