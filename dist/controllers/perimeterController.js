'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _perimeter = require('../models/perimeter.model');

var _perimeter2 = _interopRequireDefault(_perimeter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Created by chen on 17-8-23.
 */
var _require = require('../log/log'),
    Parser = _require.Parser;

var logger = {};
Parser(logger, 'PerimeterController.js');

var PerimeterController = function () {
    function PerimeterController() {
        _classCallCheck(this, PerimeterController);
    }

    _createClass(PerimeterController, null, [{
        key: 'add_perimeter',
        value: function () {
            var _ref = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee(ctx) {
                var data, isExit, perimeter, msg;
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
                                return _perimeter2.default.findOne({ ip: data.fields.ip });

                            case 6:
                                isExit = _context.sent;

                                logger.info(isExit);

                                if (!isExit) {
                                    _context.next = 10;
                                    break;
                                }

                                return _context.abrupt('return', ctx.body = { msg: '周界已添加!' });

                            case 10:
                                perimeter = new _perimeter2.default(data.fields);

                                logger.info(perimeter);
                                msg = '';

                                perimeter.save(function (err, perimeter) {
                                    if (!err) {
                                        msg = '添加周界' + perimeter.name + '成功';
                                    } else {
                                        msg = err;
                                    }
                                });

                                return _context.abrupt('return', ctx.body = { msg: msg, data: perimeter });

                            case 15:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));

            function add_perimeter(_x) {
                return _ref.apply(this, arguments);
            }

            return add_perimeter;
        }()
    }, {
        key: 'delete_perimeter',
        value: function () {
            var _ref2 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee2(ctx) {
                var id, result;
                return _regenerator2.default.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                id = ctx.params.id;

                                logger.info(id);
                                _context2.next = 4;
                                return _perimeter2.default.findByIdAndRemove(id).exec();

                            case 4:
                                result = _context2.sent;

                                if (result) {
                                    _context2.next = 7;
                                    break;
                                }

                                return _context2.abrupt('return', ctx.error = { msg: '删除周界失败!' });

                            case 7:
                                return _context2.abrupt('return', ctx.body = { msg: '删除周界成功', data: result });

                            case 8:
                            case 'end':
                                return _context2.stop();
                        }
                    }
                }, _callee2, this);
            }));

            function delete_perimeter(_x2) {
                return _ref2.apply(this, arguments);
            }

            return delete_perimeter;
        }()
    }, {
        key: 'edit_perimeter',
        value: function () {
            var _ref3 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee3(ctx) {
                var data, result;
                return _regenerator2.default.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                data = ctx.request.body;

                                logger.info(data);
                                _context3.next = 4;
                                return _perimeter2.default.update(data, { id: data.id }).exec();

                            case 4:
                                result = _context3.sent;

                                if (result) {
                                    _context3.next = 7;
                                    break;
                                }

                                return _context3.abrupt('return', ctx.error = { msg: '修改周界失败!' });

                            case 7:
                                return _context3.abrupt('return', ctx.body = { msg: '修改周界成功', data: result });

                            case 8:
                            case 'end':
                                return _context3.stop();
                        }
                    }
                }, _callee3, this);
            }));

            function edit_perimeter(_x3) {
                return _ref3.apply(this, arguments);
            }

            return edit_perimeter;
        }()
    }, {
        key: 'find_perimeter',
        value: function () {
            var _ref4 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee4(ctx) {
                var result;
                return _regenerator2.default.wrap(function _callee4$(_context4) {
                    while (1) {
                        switch (_context4.prev = _context4.next) {
                            case 0:
                                _context4.next = 2;
                                return _perimeter2.default.find().exec();

                            case 2:
                                result = _context4.sent;

                                if (result) {
                                    _context4.next = 5;
                                    break;
                                }

                                return _context4.abrupt('return', ctx.body = { msg: '没有找到周界!' });

                            case 5:
                                return _context4.abrupt('return', ctx.body = { msg: '查询周界', data: result });

                            case 6:
                            case 'end':
                                return _context4.stop();
                        }
                    }
                }, _callee4, this);
            }));

            function find_perimeter(_x4) {
                return _ref4.apply(this, arguments);
            }

            return find_perimeter;
        }()
    }, {
        key: 'find_one',
        value: function () {
            var _ref5 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee5(ctx) {
                var id, result;
                return _regenerator2.default.wrap(function _callee5$(_context5) {
                    while (1) {
                        switch (_context5.prev = _context5.next) {
                            case 0:
                                id = ctx.params.id;
                                _context5.next = 3;
                                return _perimeter2.default.findOne({ id: id }).exec();

                            case 3:
                                result = _context5.sent;

                                if (result) {
                                    _context5.next = 6;
                                    break;
                                }

                                return _context5.abrupt('return', ctx.body = { msg: '没有找到周界!' });

                            case 6:
                                return _context5.abrupt('return', ctx.body = { msg: '查询周界', data: result });

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

    return PerimeterController;
}();

exports.default = PerimeterController;
//# sourceMappingURL=perimeterController.js.map