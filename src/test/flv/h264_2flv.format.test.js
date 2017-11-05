require('../modify_config');
const IPCFactory=require('../../app/servers/ipc_factory');
const H264_2Flv=require('../../app/servers/cache/to_flv_cache');
const H254_2Flv_Ffmpeg=require('../../app/_ffmpeg/stream_ffmpeg_pipe');
let fs=require('fs');
const wOption = {
    flags: 'w',
    encoding: null,
    fd: null,
    mode: 0o666,
    autoClose: true
};

describe('ffmpeg及h264打包格式对比',()=>{
    it('',async (done)=>{
/*        console.log(process.env)
        return done();*/
        const ipc=await IPCFactory.getIPC(1);
        let convert=new H264_2Flv(true,false);
        let f1=fs.createWriteStream('d:/ipc_h264.flv',wOption);
        let f2=fs.createWriteStream('d:/ipc_h264_ffmpeg.flv',wOption);
        let f3=fs.createWriteStream('d:/ipc_h264_hex.txt',wOption);
        convert.addClient((data)=>{
           f1.write(data);
        });
        let convert2=new H254_2Flv_Ffmpeg({'audio':false,'codec':'copy'});
        convert2.on('data',(data)=>{
            f2.write(data);
        });
        ipc.on('video',(data)=>{
            f3.write(data.toString('hex')+'\r');
            convert.write(data);
            convert2.writeVedio(data);
        });

        ipc.realPlay().then(()=>{
            console.log('已启动');
            setTimeout(()=>{
                ipc.stopRealPlay().then(done).catch(done);
                f1.close();
                f2.close();
                f3.close();
            },10000);
        }).catch(done);
    });
});