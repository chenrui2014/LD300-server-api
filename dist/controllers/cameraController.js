'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Created by chen on 17-8-23.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */


var _logger = require('../logger');

var _logger2 = _interopRequireDefault(_logger);

var _camera = require('../models/camera.model');

var _camera2 = _interopRequireDefault(_camera);

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
                var data, isExit, camera, msg;
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
                                return _camera2.default.findOne({ ip: data.fields.ip });

                            case 6:
                                isExit = _context.sent;

                                _logger2.default.info(isExit);

                                if (!isExit) {
                                    _context.next = 10;
                                    break;
                                }

                                return _context.abrupt('return', ctx.body = { msg: '该摄像头ip已存在!' });

                            case 10:
                                //const result = await CameraModel.create(data);

                                camera = new _camera2.default(data.fields);

                                _logger2.default.info(camera);
                                msg = '';

                                camera.save(function (err, camera) {
                                    if (!err) {
                                        msg = '添加摄像头' + camera.name + '成功';
                                    } else {
                                        msg = err;
                                    }
                                });

                                return _context.abrupt('return', ctx.body = { msg: msg, data: camera });

                            case 15:
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
                var id, result;
                return regeneratorRuntime.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                id = ctx.params.id;

                                _logger2.default.info(id);
                                _context2.next = 4;
                                return _camera2.default.findByIdAndRemove(id).exec();

                            case 4:
                                result = _context2.sent;

                                if (result) {
                                    _context2.next = 7;
                                    break;
                                }

                                return _context2.abrupt('return', ctx.error = { msg: '删除摄像头失败!' });

                            case 7:
                                return _context2.abrupt('return', ctx.body = { msg: '删除摄像头成功', data: result });

                            case 8:
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
                var data, result;
                return regeneratorRuntime.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                data = ctx.request.body;

                                _logger2.default.info(data);
                                _context3.next = 4;
                                return _camera2.default.update(data, { id: data.id }).exec();

                            case 4:
                                result = _context3.sent;

                                if (result) {
                                    _context3.next = 7;
                                    break;
                                }

                                return _context3.abrupt('return', ctx.error = { msg: '修改摄像头失败!' });

                            case 7:
                                return _context3.abrupt('return', ctx.body = { msg: '修改摄像头成功', data: result });

                            case 8:
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

                                _context4.next = 10;
                                return _camera2.default.find(filterObj).count();

                            case 10:
                                total = _context4.sent;
                                _context4.next = 13;
                                return _camera2.default.find(filterObj).skip(pageStart).limit(pageEnd - pageStart + 1).sort(sortP);

                            case 13:
                                result = _context4.sent;

                                if (result) {
                                    _context4.next = 16;
                                    break;
                                }

                                return _context4.abrupt('return', ctx.body = { msg: '没有找到摄像头!' });

                            case 16:
                                return _context4.abrupt('return', ctx.body = { msg: '查询摄像头', data: result, total: total });

                            case 17:
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
        key: 'find_one',
        value: function () {
            var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(ctx) {
                var id, result;
                return regeneratorRuntime.wrap(function _callee5$(_context5) {
                    while (1) {
                        switch (_context5.prev = _context5.next) {
                            case 0:
                                id = ctx.params.id;
                                _context5.next = 3;
                                return _camera2.default.findOne({ id: id });

                            case 3:
                                result = _context5.sent;

                                if (result) {
                                    _context5.next = 6;
                                    break;
                                }

                                return _context5.abrupt('return', ctx.body = { msg: '没有找到摄像头!' });

                            case 6:
                                return _context5.abrupt('return', ctx.body = { msg: '查询摄像头', data: result });

                            case 7:
                            case 'end':
                                return _context5.stop();
                        }
                    }
                }, _callee5, this);
            }));

            function find_one(_x5) {
                return _ref5.apply(this, arguments);
            }

            return find_one;
        }()
    }]);

    return CameraController;
}();

exports.default = CameraController;
//# sourceMappingURL=cameraController.js.map