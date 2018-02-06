'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var getHosts = function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        return _context.abrupt('return', hosts);

                    case 1:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this);
    }));

    return function getHosts() {
        return _ref.apply(this, arguments);
    };
}();

var getMointors = function () {
    var _ref2 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee2(hostID, distance) {
        var m;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        m = _.find(mointors, function (m) {
                            return m.id === hostID;
                        })['mointors'];
                        return _context2.abrupt('return', _.filter(m, function (ipc) {
                            return ipc.min <= distance && ipc.max >= distance;
                        }));

                    case 2:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, this);
    }));

    return function getMointors(_x, _x2) {
        return _ref2.apply(this, arguments);
    };
}();

var getIPC = function () {
    var _ref3 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee3(id) {
        return _regenerator2.default.wrap(function _callee3$(_context3) {
            while (1) {
                switch (_context3.prev = _context3.next) {
                    case 0:
                        return _context3.abrupt('return', _.find(ipcs, function (ipc) {
                            return ipc.id === id;
                        }));

                    case 1:
                    case 'end':
                        return _context3.stop();
                }
            }
        }, _callee3, this);
    }));

    return function getIPC(_x3) {
        return _ref3.apply(this, arguments);
    };
}();

var recordAlert = function () {
    var _ref4 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee4() {
        return _regenerator2.default.wrap(function _callee4$(_context4) {
            while (1) {
                switch (_context4.prev = _context4.next) {
                    case 0:
                        return _context4.abrupt('return', true);

                    case 1:
                    case 'end':
                        return _context4.stop();
                }
            }
        }, _callee4, this);
    }));

    return function recordAlert() {
        return _ref4.apply(this, arguments);
    };
}();

var recordAlertVideo = function () {
    var _ref5 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee5() {
        return _regenerator2.default.wrap(function _callee5$(_context5) {
            while (1) {
                switch (_context5.prev = _context5.next) {
                    case 0:
                        return _context5.abrupt('return', true);

                    case 1:
                    case 'end':
                        return _context5.stop();
                }
            }
        }, _callee5, this);
    }));

    return function recordAlertVideo() {
        return _ref5.apply(this, arguments);
    };
}();

var getAllIPC = function () {
    var _ref6 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee6() {
        return _regenerator2.default.wrap(function _callee6$(_context6) {
            while (1) {
                switch (_context6.prev = _context6.next) {
                    case 0:
                        return _context6.abrupt('return', ipcs);

                    case 1:
                    case 'end':
                        return _context6.stop();
                }
            }
        }, _callee6, this);
    }));

    return function getAllIPC() {
        return _ref6.apply(this, arguments);
    };
}();

var transformIPC = function () {
    var _ref7 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee7(ipc) {
        return _regenerator2.default.wrap(function _callee7$(_context7) {
            while (1) {
                switch (_context7.prev = _context7.next) {
                    case 0:
                        return _context7.abrupt('return', ipc);

                    case 1:
                    case 'end':
                        return _context7.stop();
                }
            }
        }, _callee7, this);
    }));

    return function transformIPC(_x4) {
        return _ref7.apply(this, arguments);
    };
}();

/*
async function getIPCIDsSortByPoint(){
    let ret=[];
    _.each(ipcs,(ipc)=>{
        ret.push(ipc.id);
    });
    return ret;
}*/

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

/**
 * Created by Luky on 2017/10/22.
 */

var _ = require('lodash');
var config = global.server_config || require('../config/config');
var hosts = config.getData('hosts_config.json');
var ipcs = config.getData('ipcs_config.json');
var mointors = config.getData('mointors_config.json');

exports = module.exports = {
    getHosts: getHosts,
    getMointors: getMointors,
    getIPC: getIPC,
    getAllIPC: getAllIPC,
    transformIPC: transformIPC,
    //getIPCIDsSortByPoint,
    recordAlert: recordAlert,
    recordAlertVideo: recordAlertVideo
};
//# sourceMappingURL=data_server_file.js.map