'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Created by Luky on 2017/8/17.
 */
var Host = require('../host/host');
var HostServer = require('./host_server');
var IPCServer = require('./ipc_server_master');

var _require = require('../log/log'),
    Parser = _require.Parser;

var config = global.server_config || require('../config/config');
var _ = require('lodash');
var projectName = _.get(config, 'runMode.project', '');
var runModeBS = _.get(config, 'runMode.type', 'BS') === 'BS';
var MessengerServer = require('./messenger_server_http_socket');
var MessengerServerSocket = require('./messenger_server_socket');
var MessengerServerBase = require('./messenger_server');

var _require2 = require('./interfaces/addin'),
    getInterface = _require2.getInterface;

var StartUp = function () {
    function StartUp() {
        _classCallCheck(this, StartUp);

        Parser(this, 'startup.js');
        this._host_state_changed = this._onHostStateChanged.bind(this);
        this._push_server_new_client = this._onNewClient.bind(this);
    }

    _createClass(StartUp, [{
        key: '_onHostStateChanged',
        value: function _onHostStateChanged(evt) {
            this.log('尝试向前台同步主机状态', { innerEvent: evt });
            this._messengerServer && this._messengerServer.notifyHostStateChanged(evt);
        }
    }, {
        key: '_onNewClient',
        value: function _onNewClient(client) {
            this.log('尝试向新连入客户端同步主机状态');
            this._hostServer && this._messengerServer.notifyHostsState(client, this._hostServer.hostsState);
        }
    }, {
        key: 'start',
        value: function () {
            var _ref = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
                var _this = this;

                var hostServer, messengerServer;
                return _regenerator2.default.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                this.stop();
                                hostServer = new HostServer();
                                //为了不遗漏数据，先启动服务，后启动状态推送服务

                                _context.next = 4;
                                return hostServer.start().catch(function (e) {
                                    _this.error('主机服务启动失败', { innerError: e });
                                    return Promise.reject(e);
                                });

                            case 4:
                                this._hostServer = hostServer;
                                messengerServer = runModeBS ? new MessengerServer(hostServer) : new MessengerServerSocket(hostServer, null, getInterface(projectName));

                                hostServer.on(Host.Events.StateChanged, this._host_state_changed);
                                messengerServer.on(MessengerServerBase.Events.newClient, this._push_server_new_client);
                                _context.next = 10;
                                return messengerServer.start().catch(function () {
                                    hostServer.removeListener(Host.Events.StateChanged, _this._host_state_changed);
                                    messengerServer.removeListener(MessengerServerBase.Events.newClient, _this._push_server_new_client);
                                    _this._hostServer = null;
                                    _this.error('消息服务启动失败', { innerError: e });
                                    return Promise.reject(e);
                                });

                            case 10:
                                this._messengerServer = messengerServer;

                                if (!runModeBS) {
                                    _context.next = 15;
                                    break;
                                }

                                this._ipcServer = new IPCServer();
                                _context.next = 15;
                                return this._ipcServer.start().catch();

                            case 15:
                                this.log('服务已启动');

                            case 16:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));

            function start() {
                return _ref.apply(this, arguments);
            }

            return start;
        }()
    }, {
        key: 'stop',
        value: function stop() {
            if (this._hostServer) {
                this._hostServer.removeListener(Host.Events.StateChanged, this._host_state_changed);
                this._hostServer.stop();
                this._hostServer = null;
            }

            if (this._messengerServer) {
                this._messengerServer.removeListener(MessengerServerBase.Events.newClient, this._push_server_new_client);
                this._messengerServer = null;
            }

            if (this._ipcServer) {
                this._ipcServer.stop();
                this._ipcServer = null;
            }
            this.log('服务已停止');
        }
    }]);

    return StartUp;
}();

exports = module.exports = StartUp;
//# sourceMappingURL=startup.js.map