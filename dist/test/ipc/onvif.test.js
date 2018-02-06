'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var getInstance = function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee(id) {
        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        _context.next = 2;
                        return IPCF.getIPC(id);

                    case 2:
                        return _context.abrupt('return', _context.sent);

                    case 3:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this);
    }));

    return function getInstance(_x) {
        return _ref.apply(this, arguments);
    };
}();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

/**
 * Created by Luky on 2017/7/3.
 */
var _require = require('../init'),
    db = _require.db,
    file = _require.file;

var Data = require('../../servers/data_server');
var ONVIF = require('../../ipcs/onvif/onvif_ipc');
var IPCF = require('../../servers/ipc_factory');
var expect = require('chai').expect;
//const ffmpeg=require('ffmpeg');
//const rtsp=require('rtsp-ffmpeg');
//const ffmpegStream=require('../../_ffmpeg/__stream_ffmpeg');
//node-rtsp-stream
//const Recorder = require('rtsp-recorder');
var fs = require('fs');
var http = require('http');
var path = require('path');

var wOption = {
    flags: 'a',
    encoding: null,
    fd: null,
    mode: 438,
    autoClose: true
};

describe('onvif 大华测试', function () {
    var _this = this;

    var save = function () {
        var _ref3 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee3(ipc, sign) {
            var name, file, fw;
            return _regenerator2.default.wrap(function _callee3$(_context3) {
                while (1) {
                    switch (_context3.prev = _context3.next) {
                        case 0:
                            name = ipc.options.ip.split('.').join('_');
                            file = path.resolve(__dirname, '../data/' + name + '_onvif_' + sign + '.h264');
                            fw = fs.createWriteStream(file, wOption);

                            ipc.on('video', function (data) {
                                fw.write(data);
                            });
                            _context3.next = 6;
                            return ipc.realPlay();

                        case 6:
                            return _context3.abrupt('return', new Promise(function (resolve, reject) {
                                setTimeout(function () {
                                    ipc.stopRealPlay().catch(reject);
                                    resolve();
                                }, 6000);
                            }));

                        case 7:
                        case 'end':
                            return _context3.stop();
                    }
                }
            }, _callee3, this);
        }));

        return function save(_x2, _x3) {
            return _ref3.apply(this, arguments);
        };
    }();

    var dbInstance = null;
    before(_asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
        return _regenerator2.default.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        _context2.next = 2;
                        return file();

                    case 2:
                        dbInstance = _context2.sent;

                    case 3:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, _this);
    })));

    it('连接测试', function (done) {
        var ipc = new ONVIF(cfg);
        ipc.connect().then(function () {
            console.log('链接成功');
            expect(ipc.isConnected).equal(true);
            ipc.disConnect().then(done).catch(done);
        }).catch(done);
    });

    it('海康威视', _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee4() {
        var ipc;
        return _regenerator2.default.wrap(function _callee4$(_context4) {
            while (1) {
                switch (_context4.prev = _context4.next) {
                    case 0:
                        _context4.next = 2;
                        return getInstance(6);

                    case 2:
                        ipc = _context4.sent;
                        _context4.next = 5;
                        return save(ipc, 'hkws', 64);

                    case 5:
                    case 'end':
                        return _context4.stop();
                }
            }
        }, _callee4, _this);
    })));

    it('discovery', _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee5() {
        return _regenerator2.default.wrap(function _callee5$(_context5) {
            while (1) {
                switch (_context5.prev = _context5.next) {
                    case 0:
                        _context5.next = 2;
                        return ONVIF.discovery(function (data) {
                            console.log(JSON.stringify(data));
                        });

                    case 2:
                    case 'end':
                        return _context5.stop();
                }
            }
        }, _callee5, _this);
    })));

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

function rtspURI(uri, user, pwd) {
    return uri.replace('rtsp://', 'rtsp://' + user + ':' + pwd + '@');
}
//# sourceMappingURL=onvif.test.js.map