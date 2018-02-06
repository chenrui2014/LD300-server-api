'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _cameraTypeService = require('../services/cameraTypeService');

var _cameraTypeService2 = _interopRequireDefault(_cameraTypeService);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Created by chen on 17-8-23.
 */
var _require = require('../log/log'),
    Parser = _require.Parser;

var logger = {};
Parser(logger, 'CameraTypeController.js');

var CameraTypeController = function () {
    function CameraTypeController() {
        _classCallCheck(this, CameraTypeController);
    }

    _createClass(CameraTypeController, null, [{
        key: 'add_cameraType',
        value: function () {
            var _ref = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee(ctx) {
                var data, isExist, result, msg;
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

                                return _context.abrupt('return', ctx.error = { msg: '发送数据失败!' });

                            case 4:
                                _context.next = 6;
                                return _cameraTypeService2.default.isExist({ typeCode: data.typeCode });

                            case 6:
                                isExist = _context.sent;

                                if (!isExist) {
                                    _context.next = 9;
                                    break;
                                }

                                return _context.abrupt('return', ctx.error = { msg: '类型编码为[' + data.typeCode + ']的摄像头类型已存在!' });

                            case 9:
                                _context.next = 11;
                                return _cameraTypeService2.default.add_cameraType(data);

                            case 11:
                                result = _context.sent;
                                msg = '';

                                if (!result) {
                                    _context.next = 18;
                                    break;
                                }

                                msg = '添加摄像头类型' + data.typeCode + '成功';
                                return _context.abrupt('return', ctx.body = { msg: msg, data: data });

                            case 18:
                                msg = '添加失败';
                                return _context.abrupt('return', ctx.error = { msg: msg });

                            case 20:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));

            function add_cameraType(_x) {
                return _ref.apply(this, arguments);
            }

            return add_cameraType;
        }()
    }, {
        key: 'delete_cameraType',
        value: function () {
            var _ref2 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee2(ctx) {
                var id, result, msg;
                return _regenerator2.default.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                id = ctx.params.id;
                                _context2.next = 3;
                                return _cameraTypeService2.default.delete_cameraType({ id: id });

                            case 3:
                                result = _context2.sent;
                                msg = '';

                                if (!result) {
                                    _context2.next = 10;
                                    break;
                                }

                                msg = '删除摄像头类型成功';
                                return _context2.abrupt('return', ctx.body = { msg: msg, data: result });

                            case 10:
                                msg = '删除摄像头类型失败';
                                return _context2.abrupt('return', ctx.error = { msg: msg });

                            case 12:
                            case 'end':
                                return _context2.stop();
                        }
                    }
                }, _callee2, this);
            }));

            function delete_cameraType(_x2) {
                return _ref2.apply(this, arguments);
            }

            return delete_cameraType;
        }()
    }, {
        key: 'edit_cameraType',
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
                                return _cameraTypeService2.default.edit_cameraType({ _id: _id }, data);

                            case 6:
                                result = _context3.sent;

                                if (!result) {
                                    _context3.next = 9;
                                    break;
                                }

                                return _context3.abrupt('return', ctx.body = { msg: '修改摄像头类型成功', data: result });

                            case 9:
                                return _context3.abrupt('return', ctx.error = { msg: '修改摄像头类型失败!' });

                            case 10:
                            case 'end':
                                return _context3.stop();
                        }
                    }
                }, _callee3, this);
            }));

            function edit_cameraType(_x3) {
                return _ref3.apply(this, arguments);
            }

            return edit_cameraType;
        }()
    }, {
        key: 'find_cameraType',
        value: function () {
            var _ref4 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee4(ctx) {
                var _ctx$query, sort, range, filter, sortObj, rangeObj, filterObj, obj, sortP, pageStart, pageEnd, total, pagination, result, _pageStart, _pageEnd, _pagination, _pageStart2, _pageEnd2, _pagination2;

                return _regenerator2.default.wrap(function _callee4$(_context4) {
                    while (1) {
                        switch (_context4.prev = _context4.next) {
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

                                _context4.next = 13;
                                return _cameraTypeService2.default.getTotal();

                            case 13:
                                total = _context4.sent;
                                pagination = {};

                                pagination.pageStart = pageStart;
                                pagination.pageSize = pageEnd - pageStart + 1;
                                result = null;

                                if (!sortP) {
                                    _context4.next = 35;
                                    break;
                                }

                                if (!rangeObj) {
                                    _context4.next = 30;
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
                                _context4.next = 27;
                                return _cameraTypeService2.default.find_cameraType(filterObj, sortP, _pagination);

                            case 27:
                                result = _context4.sent;
                                _context4.next = 33;
                                break;

                            case 30:
                                _context4.next = 32;
                                return _cameraTypeService2.default.find_cameraType(filterObj, sortP);

                            case 32:
                                result = _context4.sent;

                            case 33:
                                _context4.next = 49;
                                break;

                            case 35:
                                if (!rangeObj) {
                                    _context4.next = 46;
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
                                _context4.next = 43;
                                return _cameraTypeService2.default.find_cameraType(filterObj, null, _pagination2);

                            case 43:
                                result = _context4.sent;
                                _context4.next = 49;
                                break;

                            case 46:
                                _context4.next = 48;
                                return _cameraTypeService2.default.find_cameraType(filterObj);

                            case 48:
                                result = _context4.sent;

                            case 49:
                                if (!result) {
                                    _context4.next = 51;
                                    break;
                                }

                                return _context4.abrupt('return', ctx.body = { msg: '查询摄像头类型', data: result, total: total });

                            case 51:
                                return _context4.abrupt('return', ctx.error = { msg: '没有找到摄像头类型!' });

                            case 52:
                            case 'end':
                                return _context4.stop();
                        }
                    }
                }, _callee4, this);
            }));

            function find_cameraType(_x4) {
                return _ref4.apply(this, arguments);
            }

            return find_cameraType;
        }()
    }, {
        key: 'find_cameraType_noPage',
        value: function () {
            var _ref5 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee5(ctx) {
                var sort, sortObj, sortP, result;
                return _regenerator2.default.wrap(function _callee5$(_context5) {
                    while (1) {
                        switch (_context5.prev = _context5.next) {
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
                                _context5.next = 6;
                                return _cameraTypeService2.default.find_cameraType(null, sortP, null);

                            case 6:
                                result = _context5.sent;

                                if (!result) {
                                    _context5.next = 9;
                                    break;
                                }

                                return _context5.abrupt('return', ctx.body = { msg: '查询摄像头类型', data: result });

                            case 9:
                                return _context5.abrupt('return', ctx.error = { msg: '没有找到摄像头类型!' });

                            case 10:
                            case 'end':
                                return _context5.stop();
                        }
                    }
                }, _callee5, this);
            }));

            function find_cameraType_noPage(_x5) {
                return _ref5.apply(this, arguments);
            }

            return find_cameraType_noPage;
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
                                _context6.next = 3;
                                return _cameraTypeService2.default.find_one(id);

                            case 3:
                                result = _context6.sent;

                                if (result) ctx.body = { msg: '查询摄像头类型', data: result };
                                return _context6.abrupt('return', ctx.error = { msg: '没有找到摄像头类型!' });

                            case 6:
                            case 'end':
                                return _context6.stop();
                        }
                    }
                }, _callee6, this);
            }));

            function find_one(_x6) {
                return _ref6.apply(this, arguments);
            }

            return find_one;
        }()
    }]);

    return CameraTypeController;
}();

exports.default = CameraTypeController;
//# sourceMappingURL=cameraTypeController.js.map