'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Created by chen on 17-8-23.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */


var _logger = require('../logger');

var _logger2 = _interopRequireDefault(_logger);

var _cameraService = require('../services/cameraService');

var _cameraService2 = _interopRequireDefault(_cameraService);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var CameraController = function () {
    function CameraController() {
        _classCallCheck(this, CameraController);
    }

    _createClass(CameraController, null, [{
        key: 'add_camera',
        value: function () {
            var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(ctx) {
                var data, isExist, result, msg;
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

                                return _context.abrupt('return', ctx.error = { msg: '发送数据失败!' });

                            case 4:
                                _context.next = 6;
                                return _cameraService2.default.isExist({ ip: data.ip });

                            case 6:
                                isExist = _context.sent;

                                if (!isExist) {
                                    _context.next = 9;
                                    break;
                                }

                                return _context.abrupt('return', ctx.error = { msg: 'ip为[' + data.ip + ']的摄像头ip已存在!' });

                            case 9:
                                _context.next = 11;
                                return _cameraService2.default.add_camera(data);

                            case 11:
                                result = _context.sent;
                                msg = '';

                                if (!result) {
                                    _context.next = 18;
                                    break;
                                }

                                msg = '添加摄像头' + data.ip + '成功';
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

            function add_camera(_x) {
                return _ref.apply(this, arguments);
            }

            return add_camera;
        }()
    }, {
        key: 'delete_camera',
        value: function () {
            var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(ctx) {
                var id, result, msg;
                return regeneratorRuntime.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                id = ctx.params.id;
                                _context2.next = 3;
                                return _cameraService2.default.delete_camera({ id: id });

                            case 3:
                                result = _context2.sent;
                                msg = '';

                                if (!result) {
                                    _context2.next = 10;
                                    break;
                                }

                                msg = '删除摄像头成功';
                                return _context2.abrupt('return', ctx.body = { msg: msg, data: result });

                            case 10:
                                msg = '删除摄像头失败';
                                return _context2.abrupt('return', ctx.error = { msg: msg });

                            case 12:
                            case 'end':
                                return _context2.stop();
                        }
                    }
                }, _callee2, this);
            }));

            function delete_camera(_x2) {
                return _ref2.apply(this, arguments);
            }

            return delete_camera;
        }()
    }, {
        key: 'edit_camera',
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
                                return _cameraService2.default.edit_camera({ _id: _id }, data);

                            case 6:
                                result = _context3.sent;

                                if (!result) {
                                    _context3.next = 9;
                                    break;
                                }

                                return _context3.abrupt('return', ctx.body = { msg: '修改摄像头成功', data: result });

                            case 9:
                                return _context3.abrupt('return', ctx.error = { msg: '修改摄像头失败!' });

                            case 10:
                            case 'end':
                                return _context3.stop();
                        }
                    }
                }, _callee3, this);
            }));

            function edit_camera(_x3) {
                return _ref3.apply(this, arguments);
            }

            return edit_camera;
        }()
    }, {
        key: 'find_camera',
        value: function () {
            var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(ctx) {
                var _ctx$query, sort, range, filter, sortObj, rangeObj, filterObj, sortP, pageStart, pageEnd, total, pagination, result;

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

                                _context4.next = 10;
                                return _cameraService2.default.getTotal();

                            case 10:
                                total = _context4.sent;
                                pagination = {};

                                pagination.pageStart = pageStart;
                                pagination.pageSize = pageEnd - pageStart + 1;

                                _context4.next = 16;
                                return _cameraService2.default.find_camera(filterObj, sortP, pagination);

                            case 16:
                                result = _context4.sent;

                                if (!result) {
                                    _context4.next = 19;
                                    break;
                                }

                                return _context4.abrupt('return', ctx.body = { msg: '查询摄像头', data: result, total: total });

                            case 19:
                                return _context4.abrupt('return', ctx.error = { msg: '没有找到摄像头!' });

                            case 20:
                            case 'end':
                                return _context4.stop();
                        }
                    }
                }, _callee4, this);
            }));

            function find_camera(_x4) {
                return _ref4.apply(this, arguments);
            }

            return find_camera;
        }()
    }, {
        key: 'find_camera_noPage',
        value: function () {
            var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(ctx) {
                var sort, sortObj, sortP, result;
                return regeneratorRuntime.wrap(function _callee5$(_context5) {
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
                                return _cameraService2.default.findAll(sortP);

                            case 6:
                                result = _context5.sent;

                                if (!result) {
                                    _context5.next = 9;
                                    break;
                                }

                                return _context5.abrupt('return', ctx.body = { msg: '查询摄像头', data: result });

                            case 9:
                                return _context5.abrupt('return', ctx.error = { msg: '没有找到摄像头!' });

                            case 10:
                            case 'end':
                                return _context5.stop();
                        }
                    }
                }, _callee5, this);
            }));

            function find_camera_noPage(_x5) {
                return _ref5.apply(this, arguments);
            }

            return find_camera_noPage;
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
                                _context6.next = 3;
                                return _cameraService2.default.find_one(id);

                            case 3:
                                result = _context6.sent;

                                if (result) ctx.body = { msg: '查询摄像头', data: result };
                                return _context6.abrupt('return', ctx.error = { msg: '没有找到摄像头!' });

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

    return CameraController;
}();

exports.default = CameraController;
//# sourceMappingURL=cameraController.js.map