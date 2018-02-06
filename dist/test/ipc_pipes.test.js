'use strict';

/**
 * Created by Luky on 2017/7/19.
 */
var spawn = require('child_process').spawn;
var ONVIF = require('../app/ipcs/onvif/onvif_ipc');
var cfg = require('./data/dhipc_onvif.json');
var fs = require('fs');
var expect = require('chai').expect;
var Cache = require('../app/servers/cache/_valve_pipe');
var CaptureTransform = require('../app/_ffmpeg/persistence_ffmpeg_pipe');
var cfg2 = require('./data/dhipc.json');
var DHIPC = require('../app/ipcs/dahua/dh_ipc');
var Stream = require('../app/_ffmpeg/stream_ffmpeg_pipe');
var path = require('path');

var wOption = {
    flags: 'w',
    encoding: null,
    fd: null,
    mode: 438,
    autoClose: true
};

describe('管道测试', function () {
    xit('阀门关闭测试缓存量', function (done) {
        var o = new ONVIF(cfg);
        o.connect().then(function () {
            var cache = new Cache(3, Math.floor(o.bitrate * 3));
            var fw = fs.createWriteStream('d:/onvif_cache1.flv', wOption);
            o.pipe(cache).pipe(fw);
            fw.on('close', function () {
                console.log('文件输出成功');
                done();
            });
            setTimeout(function () {
                o.unpipe(cache);
                cache.end();
            }, 20000);
        }).catch(done);
    });

    xit('阀门打开缓存输出', function (done) {
        var o = new ONVIF(cfg);
        o.connect().then(function () {
            var cache = new Cache(1, Math.floor(o.bitrate));
            var fw = fs.createWriteStream('d:/onvif_cache2.flv', wOption);
            o.pipe(cache).pipe(fw);
            fw.on('close', function () {
                console.log('文件输出成功');
                done();
            });
            setTimeout(function () {
                console.log('打开阀门，输出缓存');
                cache.open();
            }, 5000);
            setTimeout(function () {
                o.unpipe(cache);
                cache.end();
            }, 10000);
        }).catch(done);
    });

    function pic(o, done) {
        o.connect().then(function () {
            var cache = new Cache(3, Math.floor(o.bitrate * 3), true);
            var cap = new CaptureTransform();
            o.pipe(cache).pipe(cap, { end: false });
            cap.on('finish', done);
            setTimeout(function () {
                o.unpipe(cache);
                cache.end();
                cache.unpipe(cap);
                cap.end();
            }, 30000);
        }).catch(done);
    }

    xit('流转图片输出', function (done) {
        pic(new ONVIF(cfg), done);
    });

    xit('测试ffmpeg内存流', function (done) {
        var file = path.resolve(__dirname, './data/1.flv');
        /*        let s=new Stream({});
                s._open();*/
        var cap = new CaptureTransform();
        var _child = spawn('ffmpeg', ['-loglevel', 'error', '-i', 'pipe:0', '-c:v', 'copy', '-c:a', 'copy', '-f', 'flv', '-updatefirst', '1', '-']);
        var fd = fs.createReadStream(file, {
            flags: 'r',
            encoding: null,
            fd: null,
            mode: 438,
            autoClose: false
        });
        _child.on('error', function (err) {
            console.error(err);
        });
        _child.stdin.on('error', function (e) {
            console.error(e);
        });
        _child.stderr.on('data', function (e) {
            console.error(e.toString('utf8'));
        });
        _child.stdin.on('data', function (data) {
            console.log(data);
        });
        _child.stdout.pipe(cap);
        fd.pipe(_child.stdin);
        cap.on('finish', done);
        setTimeout(function () {
            fd;
            _child;
            done();
        }, 3000);
    });

    it('大华sdk直连测试', function (done) {
        pic(new DHIPC(cfg2), done);
    });
});
//# sourceMappingURL=ipc_pipes.test.js.map