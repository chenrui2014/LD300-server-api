'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _ppService = require('../services/ppService');

var _ppService2 = _interopRequireDefault(_ppService);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Created by chen on 17-8-23.
 */
var _require = require('../log/log'),
    Parser = _require.Parser;

var logger = {};
Parser(logger, 'PpController.js');

var PpController = function () {
    function PpController() {
        _classCallCheck(this, PpController);
    }

    _createClass(PpController, null, [{
        key: 'add_pp',
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
                                return _ppService2.default.isExist({ name: data.name });

                            case 6:
                                isExit = _context.sent;

                                logger.info(isExit);

                                if (!isExit) {
                                    _context.next = 10;
                                    break;
                                }

                                return _context.abrupt('return', ctx.body = { msg: '周界已存在!' });

                            case 10:
                                _context.next = 12;
                                return _ppService2.default.add_pp(data);

                            case 12:
                                result = _context.sent;
                                msg = '';

                                if (!result) {
                                    _context.next = 19;
                                    break;
                                }

                                msg = '添加周界' + data.port + '成功';
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

            function add_pp(_x) {
                return _ref.apply(this, arguments);
            }

            return add_pp;
        }()
    }, {
        key: 'delete_pp',
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
                                return _ppService2.default.delete_pp({ id: id });

                            case 4:
                                result = _context2.sent;
                                msg = '';

                                if (!result) {
                                    _context2.next = 11;
                                    break;
                                }

                                msg = '删除周界成功';
                                return _context2.abrupt('return', ctx.body = { msg: msg, data: result });

                            case 11:
                                msg = '删除周界失败';
                                return _context2.abrupt('return', ctx.error = { msg: msg });

                            case 13:
                            case 'end':
                                return _context2.stop();
                        }
                    }
                }, _callee2, this);
            }));

            function delete_pp(_x2) {
                return _ref2.apply(this, arguments);
            }

            return delete_pp;
        }()
    }, {
        key: 'edit_pp',
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
                                return _ppService2.default.edit_pp({ _id: _id }, data);

                            case 6:
                                result = _context3.sent;

                                if (!result) {
                                    _context3.next = 9;
                                    break;
                                }

                                return _context3.abrupt('return', ctx.body = { msg: '修改周界成功', data: result });

                            case 9:
                                return _context3.abrupt('return', ctx.error = { msg: '修改周界失败!' });

                            case 10:
                            case 'end':
                                return _context3.stop();
                        }
                    }
                }, _callee3, this);
            }));

            function edit_pp(_x3) {
                return _ref3.apply(this, arguments);
            }

            return edit_pp;
        }()
    }, {
        key: 'find_pp_noPage',
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
                                return _ppService2.default.findAll(sortP);

                            case 6:
                                result = _context4.sent;

                                if (!result) {
                                    _context4.next = 9;
                                    break;
                                }

                                return _context4.abrupt('return', ctx.body = { msg: '查询周界', data: result });

                            case 9:
                                return _context4.abrupt('return', ctx.body = { msg: '没有找到周界!' });

                            case 10:
                            case 'end':
                                return _context4.stop();
                        }
                    }
                }, _callee4, this);
            }));

            function find_pp_noPage(_x4) {
                return _ref4.apply(this, arguments);
            }

            return find_pp_noPage;
        }()
    }, {
        key: 'find_pp',
        value: function () {
            var _ref5 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee5(ctx) {
                var _ctx$query, sort, range, filter, sortObj, rangeObj, filterObj, obj, sortP, total, result, pageStart, pageEnd, pagination, _pageStart, _pageEnd, _pagination;

                return _regenerator2.default.wrap(function _callee5$(_context5) {
                    while (1) {
                        switch (_context5.prev = _context5.next) {
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

                                _context5.prev = 9;
                                _context5.next = 12;
                                return _ppService2.default.getTotal();

                            case 12:
                                total = _context5.sent;
                                result = null;

                                if (!sortP) {
                                    _context5.next = 31;
                                    break;
                                }

                                if (!rangeObj) {
                                    _context5.next = 26;
                                    break;
                                }

                                pageStart = 0, pageEnd = 0;

                                if (rangeObj && rangeObj.length >= 2) {
                                    pageStart = rangeObj[0];
                                    pageEnd = rangeObj[1];
                                }
                                pagination = {};

                                pagination.pageStart = pageStart;
                                pagination.pageSize = pageEnd - pageStart + 25;
                                _context5.next = 23;
                                return _ppService2.default.find_pp(filterObj, sortP, pagination);

                            case 23:
                                result = _context5.sent;
                                _context5.next = 29;
                                break;

                            case 26:
                                _context5.next = 28;
                                return _ppService2.default.find_pp(filterObj, sortP);

                            case 28:
                                result = _context5.sent;

                            case 29:
                                _context5.next = 45;
                                break;

                            case 31:
                                if (!rangeObj) {
                                    _context5.next = 42;
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
                                _context5.next = 39;
                                return _ppService2.default.find_pp(filterObj, null, _pagination);

                            case 39:
                                result = _context5.sent;
                                _context5.next = 45;
                                break;

                            case 42:
                                _context5.next = 44;
                                return _ppService2.default.find_pp(filterObj);

                            case 44:
                                result = _context5.sent;

                            case 45:
                                if (!result) {
                                    _context5.next = 47;
                                    break;
                                }

                                return _context5.abrupt('return', ctx.body = { msg: '查询周界', data: result, total: total });

                            case 47:
                                return _context5.abrupt('return', ctx.body = { msg: '没有找到周界!' });

                            case 50:
                                _context5.prev = 50;
                                _context5.t0 = _context5['catch'](9);

                                logger.error(_context5.t0);

                            case 53:
                            case 'end':
                                return _context5.stop();
                        }
                    }
                }, _callee5, this, [[9, 50]]);
            }));

            function find_pp(_x5) {
                return _ref5.apply(this, arguments);
            }

            return find_pp;
        }()
    }, {
        key: 'find_one',
        value: function () {
            var _ref6 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee6(ctx) {
                var id, result;
                return _regenerator2.default.wrap(function _callee6$(_context6) {
                    while (1) {
                        switch (_context6.prev = _context6.next) {
                            case 0:
                                id = ctx.params.id;
                                _context6.prev = 1;
                                _context6.next = 4;
                                return _ppService2.default.find_one(id);

                            case 4:
                                result = _context6.sent;

                                if (!result) {
                                    _context6.next = 7;
                                    break;
                                }

                                return _context6.abrupt('return', ctx.body = { msg: '查询周界', data: result });

                            case 7:
                                return _context6.abrupt('return', ctx.body = { msg: '没有找到周界!' });

                            case 10:
                                _context6.prev = 10;
                                _context6.t0 = _context6['catch'](1);

                                logger.error(_context6.t0);

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

    return PpController;
}();

exports.default = PpController;
//# sourceMappingURL=ppController.js.map