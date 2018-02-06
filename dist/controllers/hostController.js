'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _hostService = require('../services/hostService');

var _hostService2 = _interopRequireDefault(_hostService);

var _serialport = require('../serialport/serialport');

var _serialport2 = _interopRequireDefault(_serialport);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Created by chen on 17-8-23.
 */
var _require = require('../log/log'),
    Parser = _require.Parser;

var logger = {};
Parser(logger, 'HostsController.js');
//import PpService from "../services/ppService";

var HostsController = function () {
    function HostsController() {
        _classCallCheck(this, HostsController);
    }

    _createClass(HostsController, null, [{
        key: 'add_host',
        value: function () {
            var _ref = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee(ctx) {
                var data, isExit, result, msg;
                return _regenerator2.default.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                data = ctx.request.body;

                                logger.info(data);

                                if (data) {
                                    _context.next = 4;
                                    break;
                                }

                                return _context.abrupt('return', ctx.body = { msg: '发送数据失败!' });

                            case 4:
                                _context.next = 6;
                                return _hostService2.default.isExist({ port: data.port });

                            case 6:
                                isExit = _context.sent;

                                logger.info(isExit);

                                if (!isExit) {
                                    _context.next = 10;
                                    break;
                                }

                                return _context.abrupt('return', ctx.body = { msg: '主机已存在!' });

                            case 10:
                                _context.next = 12;
                                return _hostService2.default.add_host(data);

                            case 12:
                                result = _context.sent;
                                msg = '';

                                if (!result) {
                                    _context.next = 19;
                                    break;
                                }

                                msg = '添加主机' + data.port + '成功';
                                return _context.abrupt('return', ctx.body = { msg: msg, data: data });

                            case 19:
                                msg = '添加失败';
                                return _context.abrupt('return', ctx.error = { msg: msg });

                            case 21:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));

            function add_host(_x) {
                return _ref.apply(this, arguments);
            }

            return add_host;
        }()
    }, {
        key: 'delete_host',
        value: function () {
            var _ref2 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee2(ctx) {
                var id, result, msg;
                return _regenerator2.default.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                id = ctx.params.id;

                                logger.info(id);
                                _context2.next = 4;
                                return _hostService2.default.delete_host({ id: id });

                            case 4:
                                result = _context2.sent;
                                msg = '';

                                if (!result) {
                                    _context2.next = 11;
                                    break;
                                }

                                msg = '删除主机成功';
                                return _context2.abrupt('return', ctx.body = { msg: msg, data: result });

                            case 11:
                                msg = '删除主机失败';
                                return _context2.abrupt('return', ctx.error = { msg: msg });

                            case 13:
                            case 'end':
                                return _context2.stop();
                        }
                    }
                }, _callee2, this);
            }));

            function delete_host(_x2) {
                return _ref2.apply(this, arguments);
            }

            return delete_host;
        }()
    }, {
        key: 'edit_host',
        value: function () {
            var _ref3 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee3(ctx) {
                var data, _id, result;

                return _regenerator2.default.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                data = ctx.request.body;

                                logger.info(data);
                                _id = data._id;

                                delete data._id;
                                _context3.next = 6;
                                return _hostService2.default.edit_host({ _id: _id }, data);

                            case 6:
                                result = _context3.sent;

                                if (!result) {
                                    _context3.next = 9;
                                    break;
                                }

                                return _context3.abrupt('return', ctx.body = { msg: '修改主机成功', data: result });

                            case 9:
                                return _context3.abrupt('return', ctx.error = { msg: '修改主机失败!' });

                            case 10:
                            case 'end':
                                return _context3.stop();
                        }
                    }
                }, _callee3, this);
            }));

            function edit_host(_x3) {
                return _ref3.apply(this, arguments);
            }

            return edit_host;
        }()
    }, {
        key: 'find_host_noPage',
        value: function () {
            var _ref4 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee4(ctx) {
                var sort, sortObj, sortP, result;
                return _regenerator2.default.wrap(function _callee4$(_context4) {
                    while (1) {
                        switch (_context4.prev = _context4.next) {
                            case 0:
                                sort = ctx.query.sort;
                                sortObj = JSON.parse(sort);
                                sortP = {};

                                if (sortObj && sortObj.length >= 2) {
                                    if ('ASC' === sortObj[1]) {
                                        sortP[sortObj[0]] = 1;
                                    } else {
                                        sortP[sortObj[0]] = -1;
                                    }
                                }
                                _context4.next = 6;
                                return _hostService2.default.findAll(sortP);

                            case 6:
                                result = _context4.sent;

                                if (!result) {
                                    _context4.next = 9;
                                    break;
                                }

                                return _context4.abrupt('return', ctx.body = { msg: '查询主机', data: result });

                            case 9:
                                return _context4.abrupt('return', ctx.body = { msg: '没有找到主机!' });

                            case 10:
                            case 'end':
                                return _context4.stop();
                        }
                    }
                }, _callee4, this);
            }));

            function find_host_noPage(_x4) {
                return _ref4.apply(this, arguments);
            }

            return find_host_noPage;
        }()
    }, {
        key: 'getPort',
        value: function () {
            var _ref5 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee5(ctx) {
                var ports, portObj;
                return _regenerator2.default.wrap(function _callee5$(_context5) {
                    while (1) {
                        switch (_context5.prev = _context5.next) {
                            case 0:
                                _context5.next = 2;
                                return _serialport2.default.GetPortsArrived();

                            case 2:
                                ports = _context5.sent;
                                portObj = ports.map(function (item /*,i*/) {
                                    return { name: item, id: item };
                                });
                                return _context5.abrupt('return', ctx.body = { msg: '获取本机端口', data: portObj });

                            case 5:
                            case 'end':
                                return _context5.stop();
                        }
                    }
                }, _callee5, this);
            }));

            function getPort(_x5) {
                return _ref5.apply(this, arguments);
            }

            return getPort;
        }()
    }, {
        key: 'find_host',
        value: function () {
            var _ref6 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee6(ctx) {
                var _ctx$query, sort, range, filter, sortObj, rangeObj, filterObj, obj, sortP, pageStart, pageEnd, total, pagination, result, _pageStart, _pageEnd, _pagination, _pageStart2, _pageEnd2, _pagination2;

                return _regenerator2.default.wrap(function _callee6$(_context6) {
                    while (1) {
                        switch (_context6.prev = _context6.next) {
                            case 0:
                                _ctx$query = ctx.query, sort = _ctx$query.sort, range = _ctx$query.range, filter = _ctx$query.filter;
                                sortObj = null;

                                if (sort) {
                                    sortObj = JSON.parse(sort);
                                }

                                rangeObj = null;

                                if (range) {
                                    rangeObj = JSON.parse(range);
                                }

                                filterObj = null;

                                if (filter && "{}" !== filter) {
                                    obj = JSON.parse(filter);

                                    if (obj && Array.isArray(obj.id)) {
                                        filterObj = { id: { $in: obj.id } };
                                    } else {
                                        filterObj = obj;
                                    }
                                }

                                sortP = {};

                                if (sortObj && sortObj.length >= 2) {
                                    if ('ASC' === sortObj[1]) {
                                        sortP[sortObj[0]] = 1;
                                    } else {
                                        sortP[sortObj[0]] = -1;
                                    }
                                }

                                pageStart = 0, pageEnd = 0;

                                if (rangeObj && rangeObj.length >= 2) {
                                    pageStart = rangeObj[0];
                                    pageEnd = rangeObj[1];
                                }

                                _context6.prev = 11;
                                _context6.next = 14;
                                return _hostService2.default.getTotal();

                            case 14:
                                total = _context6.sent;
                                pagination = {};

                                pagination.pageStart = pageStart;
                                pagination.pageSize = pageEnd - pageStart + 1;
                                result = null;

                                if (!sortP) {
                                    _context6.next = 36;
                                    break;
                                }

                                if (!rangeObj) {
                                    _context6.next = 31;
                                    break;
                                }

                                _pageStart = 0, _pageEnd = 0;

                                if (rangeObj && rangeObj.length >= 2) {
                                    _pageStart = rangeObj[0];
                                    _pageEnd = rangeObj[1];
                                }
                                _pagination = {};

                                _pagination.pageStart = _pageStart;
                                _pagination.pageSize = _pageEnd - _pageStart + 25;
                                _context6.next = 28;
                                return _hostService2.default.find_host(filterObj, sortP, _pagination);

                            case 28:
                                result = _context6.sent;
                                _context6.next = 34;
                                break;

                            case 31:
                                _context6.next = 33;
                                return _hostService2.default.find_host(filterObj, sortP);

                            case 33:
                                result = _context6.sent;

                            case 34:
                                _context6.next = 50;
                                break;

                            case 36:
                                if (!rangeObj) {
                                    _context6.next = 47;
                                    break;
                                }

                                _pageStart2 = 0, _pageEnd2 = 0;

                                if (rangeObj && rangeObj.length >= 2) {
                                    _pageStart2 = rangeObj[0];
                                    _pageEnd2 = rangeObj[1];
                                }
                                _pagination2 = {};

                                _pagination2.pageStart = _pageStart2;
                                _pagination2.pageSize = _pageEnd2 - _pageStart2 + 25;
                                _context6.next = 44;
                                return _hostService2.default.find_host(filterObj, null, _pagination2);

                            case 44:
                                result = _context6.sent;
                                _context6.next = 50;
                                break;

                            case 47:
                                _context6.next = 49;
                                return _hostService2.default.find_host(filterObj);

                            case 49:
                                result = _context6.sent;

                            case 50:
                                if (!result) {
                                    _context6.next = 52;
                                    break;
                                }

                                return _context6.abrupt('return', ctx.body = { msg: '查询主机', data: result, total: total });

                            case 52:
                                return _context6.abrupt('return', ctx.body = { msg: '没有找到主机!' });

                            case 55:
                                _context6.prev = 55;
                                _context6.t0 = _context6['catch'](11);

                                logger.error(_context6.t0);

                            case 58:
                            case 'end':
                                return _context6.stop();
                        }
                    }
                }, _callee6, this, [[11, 55]]);
            }));

            function find_host(_x6) {
                return _ref6.apply(this, arguments);
            }

            return find_host;
        }()
    }, {
        key: 'find_one',
        value: function () {
            var _ref7 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee7(ctx) {
                var id, result;
                return _regenerator2.default.wrap(function _callee7$(_context7) {
                    while (1) {
                        switch (_context7.prev = _context7.next) {
                            case 0:
                                id = ctx.params.id;
                                _context7.prev = 1;
                                _context7.next = 4;
                                return _hostService2.default.find_one(id);

                            case 4:
                                result = _context7.sent;

                                if (!result) {
                                    _context7.next = 7;
                                    break;
                                }

                                return _context7.abrupt('return', ctx.body = { msg: '查询主机', data: result });

                            case 7:
                                return _context7.abrupt('return', ctx.body = { msg: '没有找到主机!' });

                            case 10:
                                _context7.prev = 10;
                                _context7.t0 = _context7['catch'](1);

                                logger.error(_context7.t0);

                            case 13:
                            case 'end':
                                return _context7.stop();
                        }
                    }
                }, _callee7, this, [[1, 10]]);
            }));

            function find_one(_x7) {
                return _ref7.apply(this, arguments);
            }

            return find_one;
        }()
    }]);

    return HostsController;
}();

exports.default = HostsController;
//# sourceMappingURL=hostController.js.map