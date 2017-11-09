'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Created by chen on 17-8-23.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */


var _logger = require('../logger');

var _logger2 = _interopRequireDefault(_logger);

var _perimeterPointService = require('../services/perimeterPointService');

var _perimeterPointService2 = _interopRequireDefault(_perimeterPointService);

var _hostService = require('../services/hostService');

var _hostService2 = _interopRequireDefault(_hostService);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PerimeterPointController = function () {
    function PerimeterPointController() {
        _classCallCheck(this, PerimeterPointController);
    }

    _createClass(PerimeterPointController, null, [{
        key: 'add_perimeterPoint',
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

                                return _context.abrupt('return', ctx.error = { msg: '发送数据失败!' });

                            case 4:
                                _context.next = 6;
                                return _perimeterPointService2.default.isExist({ realPosition: data.realPosition });

                            case 6:
                                isExit = _context.sent;

                                _logger2.default.info(isExit);

                                if (!isExit) {
                                    _context.next = 10;
                                    break;
                                }

                                return _context.abrupt('return', ctx.error = { msg: '该实际距离的周界点已存在!' });

                            case 10:
                                result = _perimeterPointService2.default.add_perimeterPoint(data);
                                msg = '';

                                if (!result) {
                                    _context.next = 17;
                                    break;
                                }

                                msg = '添加实际距离为' + data.port + '的周界点成功';
                                return _context.abrupt('return', ctx.body = { msg: msg, data: data });

                            case 17:
                                msg = '添加失败';
                                return _context.abrupt('return', ctx.error = { msg: msg });

                            case 19:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));

            function add_perimeterPoint(_x) {
                return _ref.apply(this, arguments);
            }

            return add_perimeterPoint;
        }()
    }, {
        key: 'delete_perimeterPoint',
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
                                return _perimeterPointService2.default.delete_perimeterPoint({ id: id });

                            case 4:
                                result = _context2.sent;
                                msg = '';

                                if (!result) {
                                    _context2.next = 11;
                                    break;
                                }

                                msg = '删除周界点成功';
                                return _context2.abrupt('return', ctx.body = { msg: msg, data: result });

                            case 11:
                                msg = '删除周界点失败';
                                return _context2.abrupt('return', ctx.error = { msg: msg });

                            case 13:
                            case 'end':
                                return _context2.stop();
                        }
                    }
                }, _callee2, this);
            }));

            function delete_perimeterPoint(_x2) {
                return _ref2.apply(this, arguments);
            }

            return delete_perimeterPoint;
        }()
    }, {
        key: 'edit_perimeterPoint',
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
                                return _perimeterPointService2.default.edit_perimeterPoint({ _id: _id }, data);

                            case 6:
                                result = _context3.sent;

                                if (result) ctx.body = { msg: '修改周界点成功', data: result };
                                return _context3.abrupt('return', ctx.error = { msg: '修改周界点失败!' });

                            case 9:
                            case 'end':
                                return _context3.stop();
                        }
                    }
                }, _callee3, this);
            }));

            function edit_perimeterPoint(_x3) {
                return _ref3.apply(this, arguments);
            }

            return edit_perimeterPoint;
        }()
    }, {
        key: 'find_perimeterPoint',
        value: function () {
            var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(ctx) {
                var _ctx$query, sort, range, filter, sortObj, sortP, total, result, hosts;

                return regeneratorRuntime.wrap(function _callee4$(_context4) {
                    while (1) {
                        switch (_context4.prev = _context4.next) {
                            case 0:
                                _ctx$query = ctx.query, sort = _ctx$query.sort, range = _ctx$query.range, filter = _ctx$query.filter;
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
                                return _perimeterPointService2.default.getTotal();

                            case 6:
                                total = _context4.sent;
                                _context4.next = 9;
                                return _perimeterPointService2.default.findAll(sortP);

                            case 9:
                                result = _context4.sent;
                                _context4.next = 12;
                                return _hostService2.default.findAll();

                            case 12:
                                hosts = _context4.sent;


                                result.forEach(function (e) {
                                    hosts.forEach(function (host) {
                                        if (e._doc.hostId === host._doc.id) e._doc.host = host._doc;
                                        return;
                                    });
                                });
                                //const result = await PerimeterPointModel.find().exec();

                                if (!result) {
                                    _context4.next = 16;
                                    break;
                                }

                                return _context4.abrupt('return', ctx.body = { msg: '查询周界点成功', data: result, total: total });

                            case 16:
                                return _context4.abrupt('return', ctx.error = { msg: '没有找到周界点!' });

                            case 17:
                            case 'end':
                                return _context4.stop();
                        }
                    }
                }, _callee4, this);
            }));

            function find_perimeterPoint(_x4) {
                return _ref4.apply(this, arguments);
            }

            return find_perimeterPoint;
        }()
    }, {
        key: 'find_one',
        value: function () {
            var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(ctx) {
                var id, result, hosts;
                return regeneratorRuntime.wrap(function _callee5$(_context5) {
                    while (1) {
                        switch (_context5.prev = _context5.next) {
                            case 0:
                                id = ctx.params.id;
                                _context5.next = 3;
                                return _perimeterPointService2.default.find_one(id);

                            case 3:
                                result = _context5.sent;
                                _context5.next = 6;
                                return _hostService2.default.findAll();

                            case 6:
                                hosts = _context5.sent;


                                result.forEach(function (e) {
                                    hosts.forEach(function (host) {
                                        if (e._doc.hostId === host._doc.id) e._doc.host = host._doc;
                                        return;
                                    });
                                });
                                if (result) ctx.body = { msg: '查询周界点', data: result };
                                return _context5.abrupt('return', ctx.error = { msg: '没有找到周界点!' });

                            case 10:
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

    return PerimeterPointController;
}();

exports.default = PerimeterPointController;
//# sourceMappingURL=perimeterPointController.js.map