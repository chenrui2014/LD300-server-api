'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Created by chen on 17-8-22.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */
// import mongoose from 'mongoose';


var _md = require('md5');

var _md2 = _interopRequireDefault(_md);

var _logger = require('../logger');

var _logger2 = _interopRequireDefault(_logger);

var _user = require('../models/user.model');

var _user2 = _interopRequireDefault(_user);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var UserController = function () {
    function UserController() {
        _classCallCheck(this, UserController);
    }

    _createClass(UserController, null, [{
        key: 'create_user',

        // 添加用户
        value: function () {
            var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(ctx) {
                var _ctx$request$body, name, email, password, isexit, result;

                return regeneratorRuntime.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                _ctx$request$body = ctx.request.body, name = _ctx$request$body.name, email = _ctx$request$body.email, password = _ctx$request$body.password;

                                if (!(!name || !password)) {
                                    _context.next = 3;
                                    break;
                                }

                                return _context.abrupt('return', ctx.render('error', {
                                    message: '用户或密码不能为空!',
                                    error: { status: 400 }
                                }));

                            case 3:
                                _context.next = 5;
                                return _user2.default.findOne({ name: name, password: (0, _md2.default)(password) });

                            case 5:
                                isexit = _context.sent;

                                if (!isexit) {
                                    _context.next = 8;
                                    break;
                                }

                                return _context.abrupt('return', ctx.render('error', {
                                    message: '该用户已存在!',
                                    error: { status: 400 }
                                }));

                            case 8:
                                _context.next = 10;
                                return AdminUserModel.create({ name: name, email: email, password: (0, _md2.default)(password) });

                            case 10:
                                result = _context.sent;

                                ctx.redirect('/');

                            case 12:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));

            function create_user(_x) {
                return _ref.apply(this, arguments);
            }

            return create_user;
        }()

        // 用户登录

    }, {
        key: 'signIn',
        value: function () {
            var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(ctx) {
                var _ctx$request$body2, name, password, user;

                return regeneratorRuntime.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                _ctx$request$body2 = ctx.request.body, name = _ctx$request$body2.name, password = _ctx$request$body2.password;
                                _context2.prev = 1;
                                _context2.next = 4;
                                return _user2.default.findOne({ username: name, password: (0, _md2.default)(password) });

                            case 4:
                                user = _context2.sent;

                                _logger2.default.info(user);

                                if (!user) {
                                    _context2.next = 8;
                                    break;
                                }

                                return _context2.abrupt('return', ctx.body = { status: "success", data: user });

                            case 8:
                                _context2.next = 14;
                                break;

                            case 10:
                                _context2.prev = 10;
                                _context2.t0 = _context2['catch'](1);

                                _logger2.default.error("登录失败");
                                return _context2.abrupt('return', ctx.body = { status: "failed", err: _context2.t0 });

                            case 14:
                            case 'end':
                                return _context2.stop();
                        }
                    }
                }, _callee2, this, [[1, 10]]);
            }));

            function signIn(_x2) {
                return _ref2.apply(this, arguments);
            }

            return signIn;
        }()

        // 用户退出

    }, {
        key: 'signOut',
        value: function () {
            var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(ctx) {
                var user;
                return regeneratorRuntime.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                _context3.prev = 0;
                                _context3.next = 3;
                                return _user2.default.findOne({ username: 'chen', password: (0, _md2.default)('chen') });

                            case 3:
                                user = _context3.sent;

                                _logger2.default.info(user);
                                ctx.body = JSON.stringify({ status: "success", data: user });
                                _context3.next = 13;
                                break;

                            case 8:
                                _context3.prev = 8;
                                _context3.t0 = _context3['catch'](0);

                                _logger2.default.error('err', _context3.t0);
                                ctx.status = 500; //状态 500
                                ctx.body = JSON.stringify({ status: 'failed' }); //返回错误状态

                            case 13:
                                return _context3.abrupt('return');

                            case 14:
                            case 'end':
                                return _context3.stop();
                        }
                    }
                }, _callee3, this, [[0, 8]]);
            }));

            function signOut(_x3) {
                return _ref3.apply(this, arguments);
            }

            return signOut;
        }()
    }]);

    return UserController;
}();

exports.default = UserController;
//# sourceMappingURL=userController.js.map