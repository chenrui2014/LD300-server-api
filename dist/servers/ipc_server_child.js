'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var getLive = function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee(id) {
        var l, ipc;
        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        l = lives[id];

                        if (!l) {
                            _context.next = 3;
                            break;
                        }

                        return _context.abrupt('return', l);

                    case 3:
                        _context.next = 5;
                        return IPCFactory.getIPC(id).catch(function () {
                            logger.warn('请求的摄像头不存在', { id: id });
                            return null;
                        });

                    case 5:
                        ipc = _context.sent;

                        if (ipc) {
                            _context.next = 8;
                            break;
                        }

                        return _context.abrupt('return', null);

                    case 8:
                        return _context.abrupt('return', lives[id] = new Live(server, ipc, '', { autoClose: true }));

                    case 9:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this);
    }));

    return function getLive(_x) {
        return _ref.apply(this, arguments);
    };
}();

var play = function () {
    var _ref2 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee2(res, id) {
        var l;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        logger.log('收到播放请求', { id: id, fn: 'live' });
                        _context2.next = 3;
                        return getLive(id);

                    case 3:
                        l = _context2.sent;

                        if (l) {
                            _context2.next = 6;
                            break;
                        }

                        return _context2.abrupt('return', fault(res, 'live', '请求的摄像头不存在', { id: id }));

                    case 6:
                        if (!l.running) {
                            _context2.next = 8;
                            break;
                        }

                        return _context2.abrupt('return', succeed(res, 'live', { port: port, path: l.path, id: id }));

                    case 8:
                        l.openWSS().then(function (ok) {
                            if (!ok) {
                                return fault(res, 'live', '获取直播流错误', { id: id }, false);
                            }
                            l.on('close', function () {
                                lives[id] = null;
                                send({ type: 'countChanged', count: --lives.length, id: id });
                            });
                            send({ type: 'countChanged', count: ++lives.length, id: id });
                            return succeed(res, 'live', { port: port, path: l.path, id: id });
                        });

                    case 9:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, this);
    }));

    return function play(_x3, _x4) {
        return _ref2.apply(this, arguments);
    };
}();

var arrchive = function () {
    var _ref3 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee3(res, id, hid) {
        var l;
        return _regenerator2.default.wrap(function _callee3$(_context3) {
            while (1) {
                switch (_context3.prev = _context3.next) {
                    case 0:
                        logger.log('收到存档请求', { id: id, hid: hid, fn: 'arrchive' });
                        _context3.next = 3;
                        return getLive(id);

                    case 3:
                        l = _context3.sent;

                        if (l) {
                            _context3.next = 6;
                            break;
                        }

                        return _context3.abrupt('return', fault(res, 'arrchive', '请求的摄像头不存在', { id: id, hid: hid }));

                    case 6:
                        l.arrchive(hid).then(function (path) {
                            send({ type: 'countChanged', count: ++lives.length, id: id });
                            return path ? succeed(res, 'arrchive', { id: id, hid: hid, path: path }) : fault(res, 'arrchive', '发生内部错误，无法存档视频流或无法打开视频流', { id: id, hid: hid }, false);
                        });

                    case 7:
                    case 'end':
                        return _context3.stop();
                }
            }
        }, _callee3, this);
    }));

    return function arrchive(_x5, _x6, _x7) {
        return _ref3.apply(this, arguments);
    };
}();

var ptz = function () {
    var _ref4 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee4(res, id, fun, params) {
        var force, stop, handle, ipc, now, promise;
        return _regenerator2.default.wrap(function _callee4$(_context4) {
            while (1) {
                switch (_context4.prev = _context4.next) {
                    case 0:
                        logger.log('收到ptz申请', { id: id, fn: 'ptz', op: fun });
                        params = params || {};
                        force = !!params.force;
                        stop = params.stop !== '0';
                        handle = params.handle;

                        if (!(_.findIndex(ptzFun, function (item) {
                            return fun === item;
                        }) === -1)) {
                            _context4.next = 7;
                            break;
                        }

                        return _context4.abrupt('return', fault(res, 'ptz', '错误的PTZ命令', { op: fun }));

                    case 7:
                        _context4.next = 9;
                        return IPCFactory.getIPC(id).catch(function () {
                            return Promise.resolve(null);
                        });

                    case 9:
                        ipc = _context4.sent;

                        if (ipc) {
                            _context4.next = 12;
                            break;
                        }

                        return _context4.abrupt('return', fault(res, 'ptz', '请求的摄像头不存在', { id: id }));

                    case 12:
                        ipc.ptz = ipc.ptz || {};
                        now = new Date().getTime();

                        if (!(!ipc.ptz.handle || force || ipc.ptz.handle !== handle && now - ipc.ptz.lastTime > ptzLock)) {
                            _context4.next = 18;
                            break;
                        }

                        ipc.ptz.handle = handle = createID();
                        _context4.next = 20;
                        break;

                    case 18:
                        if (!(ipc.ptz.handle !== handle)) {
                            _context4.next = 20;
                            break;
                        }

                        return _context4.abrupt('return', fault(res, 'ptz', 'ptz暂时由其他人控制中，请等待', { id: id }));

                    case 20:
                        ipc.ptz.lastTime = now;
                        promise = fun === 'move' ? ipc[fun].apply(ipc, [parseInt(params.position) || 1, stop]) : ipc[fun].apply(ipc, [stop]);

                        promise.then(function () {
                            succeed(res, 'ptz', { handle: handle, id: id, op: fun, limit: ptzLock });
                        }).catch(function (e) {
                            ipc.ptz.handle = null;
                            return fault(res, 'ptz', '内部处理异常', { id: id, op: fun, innerError: (e || '').toString() }, false);
                        });

                    case 23:
                    case 'end':
                        return _context4.stop();
                }
            }
        }, _callee4, this);
    }));

    return function ptz(_x8, _x9, _x10, _x11) {
        return _ref4.apply(this, arguments);
    };
}();

/*
applyMic(id){}
releaseMic(handle,id){}
sendMic(id,data){}
*/

var freePTZ = function () {
    var _ref5 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee5(res, id, params) {
        var handle, ipc;
        return _regenerator2.default.wrap(function _callee5$(_context5) {
            while (1) {
                switch (_context5.prev = _context5.next) {
                    case 0:
                        params = params || {};
                        handle = params.handle;

                        logger.log('收到ptz释放申请', { id: id, fn: 'freePTZ', handle: handle });

                        if (handle) {
                            _context5.next = 5;
                            break;
                        }

                        return _context5.abrupt('return', fault(res, 'freePTZ', '不具备PTZ的控制权', { id: id }));

                    case 5:
                        _context5.next = 7;
                        return IPCFactory.getIPC(id).catch(function () {
                            return Promise.resolve(null);
                        });

                    case 7:
                        ipc = _context5.sent;

                        if (ipc) {
                            _context5.next = 10;
                            break;
                        }

                        return _context5.abrupt('return', fault(res, 'freePTZ', '请求的摄像头不存在', { id: id }));

                    case 10:
                        if (!(handle === ipc.ptz.handle)) {
                            _context5.next = 13;
                            break;
                        }

                        ipc.ptz.handle = '';
                        return _context5.abrupt('return', succeed(res, 'freePTZ', { id: id, handle: handle }));

                    case 13:
                        return _context5.abrupt('return', fault(res, 'freePTZ', '不具备PTZ的控制权', { id: id, handle: handle }));

                    case 14:
                    case 'end':
                        return _context5.stop();
                }
            }
        }, _callee5, this);
    }));

    return function freePTZ(_x12, _x13, _x14) {
        return _ref5.apply(this, arguments);
    };
}();

var getPoint = function () {
    var _ref6 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee6(res, id) {
        var ipc, xyz;
        return _regenerator2.default.wrap(function _callee6$(_context6) {
            while (1) {
                switch (_context6.prev = _context6.next) {
                    case 0:
                        logger.log('收到获取球机坐标申请', { id: id });
                        _context6.next = 3;
                        return IPCFactory.getIPC(id).catch(function () {
                            return Promise.resolve(null);
                        });

                    case 3:
                        ipc = _context6.sent;

                        if (ipc) {
                            _context6.next = 6;
                            break;
                        }

                        return _context6.abrupt('return', fault(res, 'getPoint', '请求的摄像头不存在', { id: id }));

                    case 6:
                        _context6.next = 8;
                        return ipc.getPoint().catch(function (e) {
                            return Promise.resolve({ innerError: (e || '').toString() });
                        });

                    case 8:
                        xyz = _context6.sent;

                        if (!('innerError' in xyz)) {
                            _context6.next = 11;
                            break;
                        }

                        return _context6.abrupt('return', fault(res, 'getPoint', 'getPoint方法内部发生错误', { id: id, innerError: xyz.innerError }));

                    case 11:
                        return _context6.abrupt('return', succeed(res, 'getPoint', xyz));

                    case 12:
                    case 'end':
                        return _context6.stop();
                }
            }
        }, _callee6, this);
    }));

    return function getPoint(_x15, _x16) {
        return _ref6.apply(this, arguments);
    };
}();

var moveToPoint = function () {
    var _ref7 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee7(res, id, params) {
        var ipc, point;
        return _regenerator2.default.wrap(function _callee7$(_context7) {
            while (1) {
                switch (_context7.prev = _context7.next) {
                    case 0:
                        logger.log('收到获取球机移动到指定点申请', { id: id });
                        _context7.next = 3;
                        return IPCFactory.getIPC(id).catch(function () {
                            return Promise.resolve(null);
                        });

                    case 3:
                        ipc = _context7.sent;

                        if (ipc) {
                            _context7.next = 6;
                            break;
                        }

                        return _context7.abrupt('return', fault(res, 'moveToPoint', '请求的摄像头不存在', { id: id }));

                    case 6:
                        point = JSON.parse(params.point || "{x:-1}");

                        if (!(point.x === -1)) {
                            _context7.next = 9;
                            break;
                        }

                        return _context7.abrupt('return', fault(res, '错误的坐标'));

                    case 9:
                        ipc.moveToPoint(point.x, point.y, point.z).then(function () {
                            return succeed(res, 'moveToPoint');
                        }).catch(function (e) {
                            return fault(res, 'moveToPoint', 'moveToPoint方法内部发生错误', { id: id, innerError: (e || '').toString() });
                        });

                    case 10:
                    case 'end':
                        return _context7.stop();
                }
            }
        }, _callee7, this);
    }));

    return function moveToPoint(_x17, _x18, _x19) {
        return _ref7.apply(this, arguments);
    };
}();

var alarm = function () {
    var _ref8 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee8(res, id) {
        var ipc;
        return _regenerator2.default.wrap(function _callee8$(_context8) {
            while (1) {
                switch (_context8.prev = _context8.next) {
                    case 0:
                        logger.log('收到到拉起报警申请', { id: id });
                        _context8.next = 3;
                        return IPCFactory.getIPC(id).catch(function () {
                            return Promise.resolve(null);
                        });

                    case 3:
                        ipc = _context8.sent;

                        if (ipc) {
                            _context8.next = 6;
                            break;
                        }

                        return _context8.abrupt('return', fault(res, 'alarm', '请求的摄像头不存在', { id: id }));

                    case 6:
                        ipc.alarm().then(function () {
                            return succeed(res, 'alarm');
                        }).catch(function (e) {
                            return fault(res, 'alarm', 'alarm方法内部发生错误', { id: id, innerError: (e || '').toString() });
                        });

                    case 7:
                    case 'end':
                        return _context8.stop();
                }
            }
        }, _callee8, this);
    }));

    return function alarm(_x20, _x21) {
        return _ref8.apply(this, arguments);
    };
}();

var stopAlarm = function () {
    var _ref9 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee9(res, id) {
        var ipc;
        return _regenerator2.default.wrap(function _callee9$(_context9) {
            while (1) {
                switch (_context9.prev = _context9.next) {
                    case 0:
                        logger.log('收到消除警报申请', { id: id });
                        _context9.next = 3;
                        return IPCFactory.getIPC(id).catch(function () {
                            return Promise.resolve(null);
                        });

                    case 3:
                        ipc = _context9.sent;

                        if (ipc) {
                            _context9.next = 6;
                            break;
                        }

                        return _context9.abrupt('return', fault(res, 'stopAlarm', '请求的摄像头不存在', { id: id }));

                    case 6:
                        ipc.stopAlarm().then(function () {
                            return succeed(res, 'stopAlarm');
                        }).catch(function (e) {
                            return fault(res, 'stopAlarm', 'stopAlarm方法内部发生错误', { id: id, innerError: (e || '').toString() });
                        });

                    case 7:
                    case 'end':
                        return _context9.stop();
                }
            }
        }, _callee9, this);
    }));

    return function stopAlarm(_x22, _x23) {
        return _ref9.apply(this, arguments);
    };
}();

var listen = function () {
    var _ref10 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee10() {
        var _port;

        return _regenerator2.default.wrap(function _callee10$(_context10) {
            while (1) {
                switch (_context10.prev = _context10.next) {
                    case 0:
                        _context10.next = 2;
                        return getPort();

                    case 2:
                        _port = _context10.sent;

                        server.listen(_port);
                        port = _port;

                    case 5:
                    case 'end':
                        return _context10.stop();
                }
            }
        }, _callee10, this);
    }));

    return function listen() {
        return _ref10.apply(this, arguments);
    };
}();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

/**
 * Created by Luky on 2017/9/4.
 */

//import 'babel-polyfill';
//import connect from '../db';
var connect = require('../db/index');
var http = require('http');
var _ = require('lodash');
var Live = require('./ipc_live_server');
var getPort = require('get-port');
var IPCFactory = require('./ipc_factory');
var crypto = require('crypto');
var config = global.server_config || require('../config/config');
var store = _.get(config, 'runMode.store', 'db');
if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
    var _store = process.argv.pop();
    if (_store === 'file' || _store === 'db') {
        config.runMode.store = _store;
    }
}
var ptzLock = _.get(config, 'ipc.ptzLock', 15000);
var url = require('url');
var logger = {};

var _require = require('../log/log'),
    Parser = _require.Parser;

var port = 0;

var send = function send(data) {
    if (process.send) {
        return process.send(data);
    }
    logger.log('向主进程同步信号', { data: data });
};

var ptzFun = ['ptzStop', 'zoomAdd', 'zoomDec', 'focusAdd', 'focusDec', 'apertureAdd', 'apertureDec', 'move'];

var lives = { length: 0 };

function fault(res, fn, desc, param) {
    var warn = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : true;

    var msg = _.extend({ type: 'fault', fn: fn }, param);
    res.end(JSON.stringify(warn ? logger.warn(desc, msg) : logger.error(desc, msg)));
}

function succeed(res, fn, param, desc) {
    var msg = _.extend({ type: 'succeed', fn: fn }, param);
    res.end(JSON.stringify(logger.log(desc, msg)));
}

function stopArrchive(res, id) {
    logger.log('收到存档终止请求', { id: id, fn: 'stopArrchive' });
    var l = lives[id];
    if (!l) return fault(res, 'stopArrchive', '请求的摄像头不存在', { id: id });
    l.stopArrchive(id);
    send({ type: 'countChanged', count: --lives.length, id: id });
    return succeed(res, 'stopArrchive', { id: id });
}

var server = http.createServer();
/*server.on('upgrade', (req, socket, head) => {
    console.log('upgrade');
});*/

server.on('request', function (req, res) {
    var uri = url.parse(req.url, true);
    var paths = _.trim(uri.pathname, '/').split('/').concat(['', '', '', '']);
    if (paths[0] !== 'ipc') {
        logger.warn('未知的请求', { uri: uri });
        return;
    }
    logger.log('收到请求', { uri: uri });
    //res.setHeader('Connection','Upgrade');
    //res.setHeader('Upgrade','websocket');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With");
    res.setHeader("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    res.setHeader("X-Powered-By", ' 3.2.1');
    var id = paths[1] - 0;
    var fun = paths[2];
    var index = void 0;
    if ((index = ['live', 'stoparrchive', 'ptz', 'freeptz', 'arrchive', 'getpoint', 'movetopoint', 'alarm', 'stopalarm'].indexOf(_.toLower(fun))) === -1) {
        res.statusCode = 404;
        return res.end();
    }
    if (index === 0) {
        return play(res, id);
    }
    if (index === 1) {
        return stopArrchive(res, id);
    }
    if (index === 2) {
        //ptz/id/ptz/zoomAdd?position
        return ptz(res, id, paths[3], uri.query);
    }
    if (index === 3) {
        return freePTZ(res, id, uri.query);
    }
    if (index === 4) {
        return arrchive(res, id, paths[3]);
    }
    if (index === 5) {
        return getPoint(res, id);
    }
    if (index === 6) {
        return moveToPoint(res, id, uri.query);
    }
    if (index === 7) {
        return alarm(res, id);
    }
    if (index === 8) {
        return stopAlarm(res, id);
    }
    logger.warn('未知的方法请求', { fun: fun, uri: uri });
});

server.on('listening', function () {
    store === 'db' && connect();
    Parser(logger, 'ipc_server_child.js', { port: server.address().port });
    logger.log('摄像头直播流进程启动', { processID: process.pid, port: port });
    send({ type: 'listening', port: port });
});

server.on('error', function (err) {
    if (err.code === 'EACCES' || err.code === 'EADDRINUSE') {
        listen();
    }
    console.error({ source: 'ipc_server_child.js', desc: (err || '').toString() });
});

listen().catch();

function createID() {
    var hash = crypto.createHash('md5');
    hash.update(new Date().getTime().toString());
    return hash.digest('hex');
}

exports = module.exports = {
    server: server
};
//# sourceMappingURL=ipc_server_child.js.map