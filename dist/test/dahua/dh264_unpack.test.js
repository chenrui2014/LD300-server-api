'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

require('../modify_config');
var H264unPack = require('../../ipcs/dahua/_dh_h264_unpack');
var lineReader = require('line-reader');
var path = require('path');
var fs = require('fs');
//const H264_2FLV=require('../../servers/cache/_h264_2flv');
var IPCFactory = require('../../servers/ipc_factory');
var dhlib = require('../../ipcs/dahua/dhnetsdk');
var AAC = require('../../acc/acc_adts_parser');
var Nalu = require('../../h264/h264_nalu_parser');

var wOption = {
    flags: 'w',
    encoding: null,
    fd: null,
    mode: 438,
    autoClose: false
};

describe('大华h264视频回调数据解包测试', function () {
    var ipc = function () {
        var _ref = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee(id, done) {
            var fp, fw2, ipc;
            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            fp = fs.createWriteStream('d:/dhsdk_unpacked' + id + '.txt', wOption);
                            fw2 = fs.createWriteStream('d:/dhsdk_unpacked' + id + '.dat', wOption);
                            _context.next = 4;
                            return IPCFactory.getIPC(id);

                        case 4:
                            ipc = _context.sent;

                            ipc.play();
                            ipc.on('data', function (data) {
                                fw2.write(Buffer.concat([Buffer.from([0, 0, 0, 1]), data.d], 4 + data.d.length));
                                fp.write(data.d.toString('hex') + '\r\n');
                            });
                            setTimeout(function () {
                                fw2.close();
                                fp.close();
                                done();
                            }, 15000);

                        case 8:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, this);
        }));

        return function ipc(_x, _x2) {
            return _ref.apply(this, arguments);
        };
    }();

    function file(houzui, done) {
        var fp = path.resolve(__dirname, '../data/dh_h264_cb' + houzui + '.txt');
        var outpath = path.resolve(__dirname, '../data/dh_h264_cb' + houzui + '.h264');
        var fw2 = fs.createWriteStream(outpath, wOption);
        var unpack = new H264unPack(false);
        unpack.on('data', function (obj) {
            var data = obj.d;
            //console.log(data.toString('hex'));
            fw2.write(data);
            var from = data[2] === 1 ? 3 : 4;
            console.log(JSON.stringify(new Nalu(data.slice(from))));
        });
        lineReader.eachLine(fp, function (line, last) {
            //console.log(line);
            unpack.write(Buffer.from(line, 'hex'));
            //console.log(line);
            if (last) {
                setTimeout(done, 1000);
            }
        });
    }

    it('大华头部解析', function () {
        //08 0001 0010 00000 0803e 0000
        var s = 'f0000000ae66080052010000b2952e465a0e10b583011a028855aeb2e300000096010000fff16c40245ffc010c9ffd8a256dc2a4aa629552a58bc29171e42296253510deef8f2d097def77f75278887c40ff541c252d56a95e5cbb2a3a9c0a99a89f1bae38e55d6bc6aace3a9f2d815836a818ddbe660a048790008520c1be4af9431d8a07399d014a5865dd4dd7a5208a41400214ad41dae1ae43601025a1d4205680272b40e401283bc5842dbe58db215b901595de8f3891f412021a40542fb60829b460c2f9c4670b02ea3667532b805e2aa04c978a5ae77e0295085006406340e7302900502f3380124e688ee4235105f0220c628703605f7c02de62c2919d223bc78d0dc2f29e5180a58e9eeadf7e26d55d3ea6e7584b9bba5b4eefdfaed7576691be81dd13b83514c0062bafa00dd632070bdfc40e535b035d5800e8f1e802b8b981c06468617652010000';
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
        var buf = Buffer.from(s, 'hex');
        var buf2 = buf.slice(36);
        var ainfo = AAC.ParseADTSHeader(buf2);
        console.log(ainfo);
        var af = new dhlib.structs.AUDIO_FORMAT({
            byFormatTag: 8,
            nChannels: 1,
            wBitsPerSample: 16,
            nSamplesPerSec: 16000
        });
        console.log(af.ref().toString('hex'));
        /*let buf=Buffer.from(s,'hex');
        console.log(`结构体NET_FRAME_INFO_EX长度${dhlib.structs.FRAME_INFO_EX.size}`);
        let frameInfo=new dhlib.structs.FRAME_INFO_EX(buf);
        console.log(`结构体NET_FRAME_INFO_EX长度${dhlib.structs.NET_FRAME_INFO_EX.size}`);
        let frameInfo2=new dhlib.structs.NET_FRAME_INFO_EX(buf);
        console.log(frameInfo.inspect());*/
    });
    it('大华h264视频回调数据解包测试', function (done) {
        file('', done);
    });
    it('大华h264视频回调数据解包测试_fps10', function (done) {
        file('_fps10', done);
    });

    it('大华h264视频回调数据解包测试_啊牛', function (done) {
        file('_niu', done);
    });

    it('球机图像', function (done) {
        ipc(4, done);
    });

    xit('枪机图像', function (done) {
        ipc(1, done);
    });
});
//# sourceMappingURL=dh264_unpack.test.js.map