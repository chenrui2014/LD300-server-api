'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Created by Luky on 2017/7/4.
 */
var addin = require('../ipcs/ipc_addin');
var _ = require('lodash');
var Data = require('./data_server');

var _require = require('../log/log'),
    Parser = _require.Parser;

var IPCFactory = function () {
    function IPCFactory() {
        _classCallCheck(this, IPCFactory);

        this._ipcs = {};
        Parser(this, 'ipc_factory.js');
    }

    _createClass(IPCFactory, [{
        key: 'getIPC',
        value: function () {
            var _ref = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee(id) {
                var _this = this;

                var ipcStore, cfg, ipc;
                return _regenerator2.default.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                ipcStore = this._ipcs[id];
                                //延迟回收，便于访问后台最新的数据

                                if (!(ipcStore && ipcStore.instance && ipcStore.instance.isConnected)) {
                                    _context.next = 3;
                                    break;
                                }

                                return _context.abrupt('return', ipcStore.instance);

                            case 3:
                                _context.next = 5;
                                return Data.getIPC(id).catch(function (e) {
                                    _this.error('摄像头配置数据获取失败', { id: ipc.id, innerError: e });
                                    if (ipcStore) return null;else return Promise.reject(e);
                                });

                            case 5:
                                cfg = _context.sent;

                                if (!(!cfg && ipcStore)) {
                                    _context.next = 9;
                                    break;
                                }

                                this.warn('远程数据拉取失败，使用使用本地保存实例');
                                return _context.abrupt('return', ipcStore.instance);

                            case 9:
                                ipc = addin.createInstance(cfg);

                                if (ipc) {
                                    _context.next = 13;
                                    break;
                                }

                                _context.next = 13;
                                return Promise.reject(this.log('获取摄像头实例化失败', { config: cfg }));

                            case 13:
                                this.log('获取摄像头实例化成功', { config: cfg });
                                this._ipcs[id] = { instance: ipc, ref: 1, last: 0 };
                                return _context.abrupt('return', ipc);

                            case 16:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));

            function getIPC(_x) {
                return _ref.apply(this, arguments);
            }

            return getIPC;
        }()
    }]);

    return IPCFactory;
}();

exports = module.exports = new IPCFactory();
//# sourceMappingURL=ipc_factory.js.map