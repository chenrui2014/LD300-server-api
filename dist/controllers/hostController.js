'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Created by chen on 17-8-23.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */


var _logger = require('../logger');

var _logger2 = _interopRequireDefault(_logger);

var _host = require('../models/host.model');

var _host2 = _interopRequireDefault(_host);

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
                var data, isExit, host, msg;
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
                                return _host2.default.findOne({ ip: data.fields.ip });

                            case 6:
                                isExit = _context.sent;

                                _logger2.default.info(isExit);

                                if (!isExit) {
                                    _context.next = 10;
                                    break;
                                }

                                return _context.abrupt('return', ctx.body = { msg: '主机已存在!' });

                            case 10:
                                host = new _host2.default(data.fields);

                                _logger2.default.info(host);
                                msg = '';

                                host.save(function (err, host) {
                                    if (!err) {
                                        msg = '添加主机' + host.name + '成功';
                                    } else {
                                        msg = err;
                                    }
                                });

                                return _context.abrupt('return', ctx.body = { msg: msg, data: host });

                            case 15:
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
                var id, result;
                return regeneratorRuntime.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                id = ctx.params.id;

                                _logger2.default.info(id);
                                _context2.next = 4;
                                return _host2.default.findByIdAndRemove(id).exec();

                            case 4:
                                result = _context2.sent;

                                if (result) {
                                    _context2.next = 7;
                                    break;
                                }

                                return _context2.abrupt('return', ctx.error = { msg: '删除主机失败!' });

                            case 7:
                                return _context2.abrupt('return', ctx.body = { msg: '删除主机成功', data: result });

                            case 8:
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
                var data, result;
                return regeneratorRuntime.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                data = ctx.request.body;

                                _logger2.default.info(data);
                                _context3.next = 4;
                                return _host2.default.update(data, { id: data.id }).exec();

                            case 4:
                                result = _context3.sent;

                                if (result) {
                                    _context3.next = 7;
                                    break;
                                }

                                return _context3.abrupt('return', ctx.error = { msg: '修改主机失败!' });

                            case 7:
                                return _context3.abrupt('return', ctx.body = { msg: '修改主机成功', data: result });

                            case 8:
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
        key: 'find_host',
        value: function () {
            var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(ctx) {
                var _ctx$query, sort, range, filter, sortObj, rangeObj, filterObj, sortP, pageStart, pageEnd, total, result;

                return regeneratorRuntime.wrap(function _callee4$(_context4) {
                    while (1) {
                        switch (_context4.prev = _context4.next) {
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

                                _context4.prev = 8;
                                _context4.next = 11;
                                return _host2.default.find(filterObj).count();

                            case 11:
                                total = _context4.sent;
                                _context4.next = 14;
                                return _host2.default.find(filterObj).skip(pageStart).limit(pageEnd - pageStart + 1).sort(sortP);

                            case 14:
                                result = _context4.sent;

                                if (result) {
                                    _context4.next = 17;
                                    break;
                                }

                                return _context4.abrupt('return', ctx.body = { msg: '没有找到主机!' });

                            case 17:
                                return _context4.abrupt('return', ctx.body = { msg: '查询主机', data: result, total: total });

                            case 20:
                                _context4.prev = 20;
                                _context4.t0 = _context4['catch'](8);

                                _logger2.default.error(_context4.t0);

                            case 23:
                            case 'end':
                                return _context4.stop();
                        }
                    }
                }, _callee4, this, [[8, 20]]);
            }));

            function find_host(_x4) {
                return _ref4.apply(this, arguments);
            }

            return find_host;
        }()
    }, {
        key: 'find_one',
        value: function () {
            var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(ctx) {
                var id, result;
                return regeneratorRuntime.wrap(function _callee5$(_context5) {
                    while (1) {
                        switch (_context5.prev = _context5.next) {
                            case 0:
                                id = ctx.params.id;
                                _context5.prev = 1;
                                _context5.next = 4;
                                return _host2.default.findOne({ id: id }).exec();

                            case 4:
                                result = _context5.sent;

                                if (result) {
                                    _context5.next = 7;
                                    break;
                                }

                                return _context5.abrupt('return', ctx.body = { msg: '没有找到主机!' });

                            case 7:
                                return _context5.abrupt('return', ctx.body = { msg: '查询主机', data: result });

                            case 10:
                                _context5.prev = 10;
                                _context5.t0 = _context5['catch'](1);

                                _logger2.default.error(_context5.t0);

                            case 13:
                            case 'end':
                                return _context5.stop();
                        }
                    }
                }, _callee5, this, [[1, 10]]);
            }));

            function find_one(_x5) {
                return _ref5.apply(this, arguments);
            }

            return find_one;
        }()
    }]);

    return HostsController;
}();

exports.default = HostsController;
//# sourceMappingURL=hostController.js.map