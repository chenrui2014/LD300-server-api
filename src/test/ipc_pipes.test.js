/**
 * Created by Luky on 2017/7/19.
 */
const spawn = require('child_process').spawn;
const ONVIF=require('../app/ipcs/onvif/onvif_ipc');
const cfg=require('./data/dhipc_onvif.json');
const fs = require('fs');
const expect = require('chai').expect;
const Cache=require('../app/servers/cache/_valve_pipe');
const CaptureTransform=require('../app/_ffmpeg/persistence_ffmpeg_pipe');
const cfg2=require('./data/dhipc.json');
const DHIPC=require('../app/ipcs/dahua/dh_ipc');
const Stream=require('../app/_ffmpeg/stream_ffmpeg_pipe');
const path=require('path');

const wOption = {
    flags: 'w',
    encoding: null,
    fd: null,
    mode: 0o666,
    autoClose: true
};

describe('管道测试',()=>{
    xit('阀门关闭测试缓存量',(done)=>{
        let o=new ONVIF(cfg);
        o.connect().then(()=>{
            let cache=new Cache(3,Math.floor(o.bitrate*3));
            let fw=fs.createWriteStream('d:/onvif_cache1.flv',wOption);
            o.pipe(cache).pipe(fw);
            fw.on('close',()=>{
                console.log('文件输出成功');
                done();
            });
            setTimeout(()=>{
                o.unpipe(cache);
                cache.end();
            },20000);
        }).catch(done);

    });

    xit('阀门打开缓存输出',(done)=>{
        let o=new ONVIF(cfg);
        o.connect().then(()=>{
            let cache=new Cache(1,Math.floor(o.bitrate));
            let fw=fs.createWriteStream('d:/onvif_cache2.flv',wOption);
            o.pipe(cache).pipe(fw);
            fw.on('close',()=>{
                console.log('文件输出成功');
                done();
            });
            setTimeout(()=>{
                console.log('打开阀门，输出缓存');
                cache.open();
            },5000);
            setTimeout(()=>{
                o.unpipe(cache);
                cache.end();
            },10000);
        }).catch(done);
    });

    function pic(o,done){
        o.connect().then(()=>{
            let cache=new Cache(3,Math.floor(o.bitrate*3),true);
            let cap=new CaptureTransform();
            o.pipe(cache).pipe(cap,{end:false});
            cap.on('finish',done);
            setTimeout(()=>{
                o.unpipe(cache);
                cache.end();
                cache.unpipe(cap);
                cap.end();
            },30000);
        }).catch(done);
    }

    xit('流转图片输出',(done)=>{
        pic(new ONVIF(cfg),done);
    });

    xit('测试ffmpeg内存流',(done)=>{
        const file=path.resolve(__dirname,'./data/1.flv');
/*        let s=new Stream({});
        s._open();*/
        let cap=new CaptureTransform();
        let _child=spawn('ffmpeg',[
            '-loglevel', 'error'
            ,'-i','pipe:0'
            ,'-c:v','copy'
            ,'-c:a','copy'
            ,'-f','flv'
            ,'-updatefirst', '1'
            ,'-'
        ]);
        let fd=fs.createReadStream(file,{
            flags: 'r',
            encoding: null,
            fd: null,
            mode: 0o666,
            autoClose: false
        });
        _child.on('error',(err)=>{
            console.error(err);
        });
        _child.stdin.on('error',(e)=>{
            console.error(e);
        });
        _child.stderr.on('data',(e)=>{
            console.error(e.toString('utf8'));
        });
        _child.stdin.on('data',(data)=>{
            console.log(data);
        });
        _child.stdout.pipe(cap);
        fd.pipe(_child.stdin);
        cap.on('finish',done);
        setTimeout(()=>{
            fd;
            _child;
            done();
        },3000);
    });

    it('大华sdk直连测试',(done)=>{
        pic(new DHIPC(cfg2),done);
    });
});