'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Created by Luky on 2017/6/23.
 */
var Host = require('../host/host');
var _ = require('lodash');
var EventEmitter = require('events').EventEmitter;
//const util = require('util');
//const assert=require('assert');
//const factory=require('./ipc_factory');
var config = global.server_config || require('../config/config');
var ipcPort = _.get(config, 'ipc_server.port', 3000);
var http = require('http');

var _require = require('../log/log'),
    Parser = _require.Parser;

var IPCMointor = require('./ipc_mointors');
var runModeBS = _.get(config, 'runMode.type', 'BS') === 'BS';
var Data = require('./data_server');
//const moment = require('moment');
var path = require('path');
//const uuidv1=require('uuid/v1');

var _Errors = {
    LinkFault: 'linkFault',
    NoMointor: 'noMointor',
    IPCServerError: 'IPCServerError',
    IPCConnectError: 'IPCConnectError'
};

var HostServer = function (_EventEmitter) {
    _inherits(HostServer, _EventEmitter);

    function HostServer(options) {
        var start = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

        _classCallCheck(this, HostServer);

        //this.typeClient=_.get(options,'type',_.get(config,'ipc_server.type','client'))==='client';
        //this.typeClient=false;
        var _this = _possibleConstructorReturn(this, (HostServer.__proto__ || Object.getPrototypeOf(HostServer)).call(this));

        _this.__hosts = null;
        _this._host_state_changed = _this._OnHostStateChanged.bind(_this);
        _this._ipcServerPort = _.get(options, 'ipc_server.port', ipcPort);
        Parser(_this, 'host_server.js');
        if (start) _this.start();
        return _this;
    }

    _createClass(HostServer, [{
        key: '_OnHostStateChanged',
        value: function _OnHostStateChanged(data) {
            this._states['hs' + data.hid] = data;
            if (data.stateNew === Host.States.Alarm) {
                this._OnIntrusionAlert(data);
            } else if (data.stateNew === Host.States.Normal) {
                this._OnDeactivateAlert(data);
            } else this.emit(Host.Events.StateChanged, data);
        }
    }, {
        key: 'emit',
        value: function emit(name, data) {
            return EventEmitter.prototype.emit.call(this, name, _.extend({
                type: name
            }, data));
        }
    }, {
        key: '_getHost',
        value: function _getHost(id) {
            return _.find(this.__hosts, function (host) {
                return host.id === id;
            });
        }
    }, {
        key: '_IPCRequest',
        value: function _IPCRequest(path) {
            var _this2 = this;

            var options = {
                hostname: 'localhost',
                port: this._ipcServerPort,
                path: path,
                method: 'GET',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            };

            return new Promise(function (resolve, reject) {
                var req = http.request(options, function (res) {
                    res.setEncoding('utf8');
                    res.on('data', function (data) {
                        resolve(JSON.parse(data));
                    });
                });

                req.on('error', function (e) {
                    _this2.warn('IPC服务错误', { innerError: e, errorType: _Errors.IPCServerError });
                    reject(e);
                });
                req.end();
            });
        }
    }, {
        key: '_arrchive',
        value: function () {
            var _ref = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee(id, hid, evtID) {
                var data;
                return _regenerator2.default.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                _context.next = 2;
                                return this._IPCRequest('/ipc/' + id + '/arrchive/' + hid + '?t=' + new Date().getTime() + ')}');

                            case 2:
                                data = _context.sent;

                                if (!(data.type === 'fault')) {
                                    _context.next = 6;
                                    break;
                                }

                                _context.next = 6;
                                return Promise.reject(this.error('录制视频失败', { innerError: data }));

                            case 6:

                                data.path = path.relative(config.getVideoPath(), data.path);
                                Data.recordAlertVideo({ pid: id, hid: hid, id: evtID, path: data.path }).catch(function (e) {
                                    return e;
                                });
                                return _context.abrupt('return', this.log('启用视频录制', { id: id, hid: hid, evtID: evtID }));

                            case 9:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));

            function _arrchive(_x2, _x3, _x4) {
                return _ref.apply(this, arguments);
            }

            return _arrchive;
        }()
    }, {
        key: '_stopArrchive',
        value: function () {
            var _ref2 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee2(id, hid) {
                var data;
                return _regenerator2.default.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                _context2.next = 2;
                                return this._IPCRequest('/ipc/' + id + '/stoparrchive/' + hid + '?t=' + new Date().getTime() + ')}');

                            case 2:
                                data = _context2.sent;

                                if (!(data.type === 'fault')) {
                                    _context2.next = 6;
                                    break;
                                }

                                _context2.next = 6;
                                return Promise.reject(this.error('停止录制视频失败', { innerError: data }));

                            case 6:
                                this.log('停止视频录制成功', { id: id, hid: hid });

                            case 7:
                            case 'end':
                                return _context2.stop();
                        }
                    }
                }, _callee2, this);
            }));

            function _stopArrchive(_x5, _x6) {
                return _ref2.apply(this, arguments);
            }

            return _stopArrchive;
        }()
    }, {
        key: '_moveToPoint',
        value: function () {
            var _ref3 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee3(id, point, hid) {
                var data;
                return _regenerator2.default.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                _context3.next = 2;
                                return this._IPCRequest('/ipc/' + id + '/moveToPoint/' + hid + '?point=' + encodeURI(JSON.stringify(point)) + '&t=' + new Date().getTime() + ')}');

                            case 2:
                                data = _context3.sent;

                                if (!(data.type === 'fault')) {
                                    _context3.next = 6;
                                    break;
                                }

                                _context3.next = 6;
                                return Promise.reject(this.error('ptz移动失败', { innerError: data }));

                            case 6:
                                this.log('成功移动到报警位置', { id: id, hid: hid });

                            case 7:
                            case 'end':
                                return _context3.stop();
                        }
                    }
                }, _callee3, this);
            }));

            function _moveToPoint(_x7, _x8, _x9) {
                return _ref3.apply(this, arguments);
            }

            return _moveToPoint;
        }()
    }, {
        key: '_alarm',
        value: function () {
            var _ref4 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee4(id, hid) {
                var data;
                return _regenerator2.default.wrap(function _callee4$(_context4) {
                    while (1) {
                        switch (_context4.prev = _context4.next) {
                            case 0:
                                _context4.next = 2;
                                return this._IPCRequest('/ipc/' + id + '/alarm/' + hid + '?t=' + new Date().getTime() + ')}');

                            case 2:
                                data = _context4.sent;

                                if (!(data.type === 'fault')) {
                                    _context4.next = 6;
                                    break;
                                }

                                _context4.next = 6;
                                return Promise.reject(this.error('拉响警报失败', { innerError: data }));

                            case 6:
                                this.log('成功拉响警报', { id: id, hid: hid });

                            case 7:
                            case 'end':
                                return _context4.stop();
                        }
                    }
                }, _callee4, this);
            }));

            function _alarm(_x10, _x11) {
                return _ref4.apply(this, arguments);
            }

            return _alarm;
        }()
    }, {
        key: '_stopAlarm',
        value: function () {
            var _ref5 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee5(id, hid) {
                var data;
                return _regenerator2.default.wrap(function _callee5$(_context5) {
                    while (1) {
                        switch (_context5.prev = _context5.next) {
                            case 0:
                                _context5.next = 2;
                                return this._IPCRequest('/ipc/' + id + '/stopAlarm/' + hid + '?t=' + new Date().getTime() + ')}');

                            case 2:
                                data = _context5.sent;

                                if (!(data.type === 'fault')) {
                                    _context5.next = 6;
                                    break;
                                }

                                _context5.next = 6;
                                return Promise.reject(this.error('关闭警报失败', { innerError: data }));

                            case 6:
                                this.log('成功关闭警报', { id: id, hid: hid });

                            case 7:
                            case 'end':
                                return _context5.stop();
                        }
                    }
                }, _callee5, this);
            }));

            function _stopAlarm(_x12, _x13) {
                return _ref5.apply(this, arguments);
            }

            return _stopAlarm;
        }()
    }, {
        key: '_OnIntrusionAlert',
        value: function () {
            var _ref6 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee7(evt) {
                var _this3 = this;

                var hostID, host, ms;
                return _regenerator2.default.wrap(function _callee7$(_context7) {
                    while (1) {
                        switch (_context7.prev = _context7.next) {
                            case 0:
                                this.log('收到主机报警指令', { innerEvent: evt });
                                hostID = evt.hid;
                                host = this._getHost(hostID);


                                Data.recordAlert({ hid: hostID, id: evt.id, position: evt.position }).catch(function (e) {
                                    return e;
                                });

                                host.monintors = [];
                                _context7.next = 7;
                                return host.mointorHandle.getMointors(evt.position).catch(function () {
                                    return Promise.resolve([]);
                                });

                            case 7:
                                ms = _context7.sent;

                                this.emit(Host.Events.StateChanged, _.extend(evt, { monintors: _.transform(ms, function (result, val) {
                                        result.push({ id: val.id, demo: val.demo, talk: val.talk });
                                    }) }));
                                if (ms.length) {
                                    this.log('获取监控摄像头', { monitors: ms, innerEvent: evt });
                                } else {
                                    this.warn('监测到主机报警，但未找到合适的监控摄像头', {
                                        errorType: _Errors.NoMointor,
                                        innerEvent: evt
                                    });
                                }

                                if (runModeBS) {
                                    _context7.next = 12;
                                    break;
                                }

                                return _context7.abrupt('return');

                            case 12:

                                host.monintors = ms;

                                ms.map(function () {
                                    var _ref7 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee6(ipc) {
                                        return _regenerator2.default.wrap(function _callee6$(_context6) {
                                            while (1) {
                                                switch (_context6.prev = _context6.next) {
                                                    case 0:
                                                        if (ipc.supportPTZ && ipc.x !== -1) _this3._moveToPoint(ipc.id, ipc, hostID).catch(function (e) {
                                                            return e;
                                                        });
                                                        if (true || ipc.screenshot) _this3._arrchive(ipc.id, hostID, evt.id).catch(function (e) {
                                                            return e;
                                                        });
                                                        if (ipc.supportAlarm) _this3._alarm(ipc.id, hostID).catch(function (e) {
                                                            return e;
                                                        });

                                                    case 3:
                                                    case 'end':
                                                        return _context6.stop();
                                                }
                                            }
                                        }, _callee6, _this3);
                                    }));

                                    return function (_x15) {
                                        return _ref7.apply(this, arguments);
                                    };
                                }());

                            case 14:
                            case 'end':
                                return _context7.stop();
                        }
                    }
                }, _callee7, this);
            }));

            function _OnIntrusionAlert(_x14) {
                return _ref6.apply(this, arguments);
            }

            return _OnIntrusionAlert;
        }()
    }, {
        key: '_OnDeactivateAlert',
        value: function _OnDeactivateAlert(evt) {
            var _this4 = this;

            this.log('收到主机消警指令', { innerEvent: evt });
            var hostID = evt.hid;
            var host = this._getHost(hostID);
            var ms = host.monintors || [];
            this.emit(Host.Events.StateChanged, _.extend(evt, { monintors: _.transform(ms, function (result, val) {
                    result.push({ id: val.id });
                }) }));
            delete host.monintors;
            if (ms.length === 0) {
                return;
            }
            if (!runModeBS) return;
            _.forEach(ms, function (ipc) {
                _this4._stopArrchive(ipc.id, hostID).catch(function (e) {
                    return e;
                });
                _this4._stopAlarm(ipc.id, hostID).catch(function (e) {
                    return e;
                });
            });
        }
    }, {
        key: 'start',
        value: function () {
            var _ref8 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee8() {
                var _this5 = this;

                return _regenerator2.default.wrap(function _callee8$(_context8) {
                    while (1) {
                        switch (_context8.prev = _context8.next) {
                            case 0:
                                this.stop();
                                this._states = {};
                                _context8.next = 4;
                                return Data.getHosts();

                            case 4:
                                this.__hosts = _context8.sent;

                                if (!(!this.hosts || !this.hosts.length)) {
                                    _context8.next = 8;
                                    break;
                                }

                                this.warn('请配置主机');
                                return _context8.abrupt('return');

                            case 8:
                                return _context8.abrupt('return', new Promise(function (resolve, reject) {
                                    var i = 0,
                                        ok = 0;
                                    var addone = function addone() {
                                        if (++i === _this5.hosts.length) {
                                            if (ok === 0) return reject();
                                            resolve();
                                        }
                                    };
                                    _.each(_this5.hosts, function (host) {
                                        var h = new Host(host.id, host.port, null, false);
                                        h.on(Host.Events.StateChanged, _this5._host_state_changed);
                                        h.connect().then(function () {
                                            host.mointorHandle = new IPCMointor(host.id);
                                            host.instance = h;
                                            ok++;
                                            addone();
                                        }).catch(function () {
                                            addone();
                                            h.removeListener(Host.Events.StateChanged, _this5._host_state_changed);
                                        });
                                    });
                                    _this5.log('主机服务已启动');
                                }));

                            case 9:
                            case 'end':
                                return _context8.stop();
                        }
                    }
                }, _callee8, this);
            }));

            function start() {
                return _ref8.apply(this, arguments);
            }

            return start;
        }()
    }, {
        key: 'stop',
        value: function stop() {
            var _this6 = this;

            var hosts = this.__hosts;
            if (!hosts || hosts.length === 0) return;
            var running = false;
            _.each(hosts, function (host) {
                if (host.instance) {
                    running = true;
                    host.instance.removeListener(Host.Events.StateChanged, _this6._host_state_changed);
                    host.instance.disConnect().catch(function (e) {
                        return e;
                    });
                    delete host.instance;
                    delete host.mointorHandle;
                }
            });
            if (running) this.log('主机服务已停止');
        }
    }, {
        key: 'clearAlarm',
        value: function clearAlarm(id) {
            this.log('收到主机复位申请', { id: id });
            var host = this._getHost(id);
            if (host && host.instance) return host.instance.clearAlarm();
            return Promise.reject('不存在主机');
        }
    }, {
        key: 'hosts',
        get: function get() {
            return this.__hosts;
        }
    }, {
        key: 'hostsState',
        get: function get() {
            return this._states;
        }
    }]);

    return HostServer;
}(EventEmitter);

exports = module.exports = HostServer;
//# sourceMappingURL=host_server.js.map