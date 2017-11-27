/**
 * Created by Luky on 2017/7/3.
 */
const ONVIF=require('../../ipcs/onvif/onvif_ipc');
const cfg=require('../data/dhipc_onvif.json');
const expect = require('chai').expect;
//const ffmpeg=require('ffmpeg');
//const rtsp=require('rtsp-ffmpeg');
//const ffmpegStream=require('../../_ffmpeg/__stream_ffmpeg');
//node-rtsp-stream
//const Recorder = require('rtsp-recorder');
const fs = require('fs');
const http = require('http');

const wOption = {
    flags: 'a',
    encoding: null,
    fd: null,
    mode: 0o666,
    autoClose: true
};

describe('onvif 大华测试',function(){

   it('连接测试',(done)=>{
       let ipc=new ONVIF(cfg);
       ipc.connect().then(()=>{
           console.log('链接成功');
           expect(ipc.isConnected).equal(true);
           ipc.disConnect().then(done).catch(done);
       }).catch(done);
   });

   it('直播流存储文件',(done)=>{
       let o=new ONVIF(cfg);
       o.on('data',(buf)=>{
           console.log(buf.length);
       });
       let fw=fs.createWriteStream('d:/onvif.txt',wOption);
       o.on('data',(data)=>{
           fw.write(data.toString('hex')+'\r\n');
       });
       o._realPlay().then(()=>{
           o.pipe(fs.createWriteStream('d:/onvif.flv',wOption));
           setTimeout(done,20000);
       }).catch(done);
   });

   /*it('直播地址测试',(done)=>{
       let o=new ONVIF(cfg);
       o._realPlay().then((ps)=> {
           let uri=ps.uri;
           console.log('pre play');
           console.log(uri);

           let stream=new ffmpegStream({
               input:rtspURI(uri,cfg.user,cfg.pwd),
               output:'flv',
               resolution:`${ps.width}*${ps.height}`,
               quality:ps.quality,
               rate:ps.fps,
               bitrate:ps.bitrate,
               arguments:['-rtsp_transport', 'tcp']
           });
           let fw = fs.createWriteStream('d:/onvif.flv',wOption);
           stream.on('data',(data)=>{
               fw.write(data);
           });
           /!*let Recorder = require('rtsp-recorder');

           uri = uri.replace('rtsp://', 'rtsp://admin:admin@');

           let rec = new Recorder({
               url: uri, //url to rtsp stream
               timeLimit: 10, //length of one video file (seconds)
               folder: 'd:', //path to video folder
               prefix: 'vid-', //prefix for video files
               movieWidth: 1280, //width of video
               movieHeight: 720, //height of video
               maxDirSize: 1024 * 20, //max size of folder with videos (MB), when size of folder more than limit folder will be cleared
               maxTryReconnect: 15 //max count for reconnects
           });

//start recording
           rec.initialize();
           *!/

           setTimeout(()=> {
               return o._stopRealPlay().then(() => {
                   console.log('stop play');
                   done();
               }).catch(done);
           },10000);
       }).catch(done);
   });*/
});


function rtspURI(uri,user,pwd){
    return uri.replace('rtsp://', `rtsp://${user}:${pwd}@`);
}