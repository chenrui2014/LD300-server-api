'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Created by chen on 17-8-23.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */


var _logger = require('../logger');

var _logger2 = _interopRequireDefault(_logger);

var _hostService = require('../services/hostService');

var _hostService2 = _interopRequireDefault(_hostService);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var HostsController = function () {
    function HostsController() {
        _classCallCheck(this, HostsController);
    }

    _createClass(HostsController, null, [{
        key: 'add_host',
        value: function () {
            var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(ctx) {
                var data, isExit, result, msg;
                return regeneratorRuntime.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                data = ctx.request.body;

                                _logger2.default.info(data);

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

                                _logger2.default.info(isExit);

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
            var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(ctx) {
                var id, result, msg;
                return regeneratorRuntime.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                id = ctx.params.id;

                                _logger2.default.info(id);
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
            var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(ctx) {
                var data, _id, result;

                return regeneratorRuntime.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                data = ctx.request.body;

                                _logger2.default.info(data);
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
            var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(ctx) {
                var sort, sortObj, sortP, result;
                return regeneratorRuntime.wrap(function _callee4$(_context4) {
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
        key: 'find_host',
        value: function () {
            var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(ctx) {
                var _ctx$query, sort, range, filter, sortObj, rangeObj, filterObj, sortP, pageStart, pageEnd, total, pagination, result;

                return regeneratorRuntime.wrap(function _callee5$(_context5) {
                    while (1) {
                        switch (_context5.prev = _context5.next) {
                            case 0:
                                _ctx$query = ctx.query, sort = _ctx$query.sort, range = _ctx$query.range, filter = _ctx$query.filter;
                                sortObj = JSON.parse(sort);
                                rangeObj = JSON.parse(range);
                                filterObj = JSON.parse(filter);
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

                                _context5.prev = 8;
                                _context5.next = 11;
                                return _hostService2.default.getTotal();

                            case 11:
                                total = _context5.sent;
                                pagination = {};

                                pagination.pageStart = pageStart;
                                pagination.pageSize = pageEnd - pageStart + 1;

                                _context5.next = 17;
                                return _hostService2.default.find_host(filterObj, sortP, pagination);

                            case 17:
                                result = _context5.sent;

                                if (!result) {
                                    _context5.next = 20;
                                    break;
                                }

                                return _context5.abrupt('return', ctx.body = { msg: '查询主机', data: result, total: total });

                            case 20:
                                return _context5.abrupt('return', ctx.body = { msg: '没有找到主机!' });

                            case 23:
                                _context5.prev = 23;
                                _context5.t0 = _context5['catch'](8);

                                _logger2.default.error(_context5.t0);

                            case 26:
                            case 'end':
                                return _context5.stop();
                        }
                    }
                }, _callee5, this, [[8, 23]]);
            }));

            function find_host(_x5) {
                return _ref5.apply(this, arguments);
            }

            return find_host;
        }()
    }, {
        key: 'find_one',
        value: function () {
            var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(ctx) {
                var id, result;
                return regeneratorRuntime.wrap(function _callee6$(_context6) {
                    while (1) {
                        switch (_context6.prev = _context6.next) {
                            case 0:
                                id = ctx.params.id;
                                _context6.prev = 1;
                                _context6.next = 4;
                                return _hostService2.default.find_one(id);

                            case 4:
                                result = _context6.sent;

                                if (!result) {
                                    _context6.next = 7;
                                    break;
                                }

                                return _context6.abrupt('return', ctx.body = { msg: '查询主机', data: result });

                            case 7:
                                return _context6.abrupt('return', ctx.body = { msg: '没有找到主机!' });

                            case 10:
                                _context6.prev = 10;
                                _context6.t0 = _context6['catch'](1);

                                _logger2.default.error(_context6.t0);

                            case 13:
                            case 'end':
                                return _context6.stop();
                        }
                    }
                }, _callee6, this, [[1, 10]]);
            }));

            function find_one(_x6) {
                return _ref6.apply(this, arguments);
            }

            return find_one;
        }()
    }]);

    return HostsController;
}();

exports.default = HostsController;
//# sourceMappingURL=hostController.js.map