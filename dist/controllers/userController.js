'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Created by chen on 17-8-22.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */
// import mongoose from 'mongoose';


var _md = require('md5');

var _md2 = _interopRequireDefault(_md);

var _user = require('../models/user.model');

var _user2 = _interopRequireDefault(_user);

var _accessToken = require('../models/accessToken');

var _accessToken2 = _interopRequireDefault(_accessToken);

var _utils = require('../utils');

var _admin2 = require('../config/admin');

var _admin3 = _interopRequireDefault(_admin2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _require = require('../log/log'),
    Parser = _require.Parser;

var logger = {};
Parser(logger, 'UserController.js');

var UserController = function () {
    function UserController() {
        _classCallCheck(this, UserController);
    }

    _createClass(UserController, null, [{
        key: 'signToken',
        value: function () {
            var _ref = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee(ctx, next) {
                var user, result;
                return _regenerator2.default.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                user = ctx.req.user;
                                _context.next = 3;
                                return _accessToken2.default.findOneAndRemove({ user: user._id });

                            case 3:
                                _context.next = 5;
                                return _accessToken2.default.create({
                                    token: genHash(user.username + Date.now()),
                                    user: user._id
                                });

                            case 5:
                                result = _context.sent;


                                ctx.status = 200;
                                ctx.body = {
                                    success: true,
                                    data: result
                                };

                            case 8:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));

            function signToken(_x, _x2) {
                return _ref.apply(this, arguments);
            }

            return signToken;
        }()
    }, {
        key: 'getUserByToken',
        value: function () {
            var _ref2 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee2(ctx, next) {
                return _regenerator2.default.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                ctx.status = 200;
                                ctx.body = {
                                    success: true,
                                    data: ctx.req.user
                                };

                            case 2:
                            case 'end':
                                return _context2.stop();
                        }
                    }
                }, _callee2, this);
            }));

            function getUserByToken(_x3, _x4) {
                return _ref2.apply(this, arguments);
            }

            return getUserByToken;
        }()

        // 当数据库中user表示空的时候，创建超级管理员

    }, {
        key: 'seed',
        value: function () {
            var _ref3 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee3(ctx, next) {
                var users, _admin;

                return _regenerator2.default.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                _context3.next = 2;
                                return _user2.default.find({});

                            case 2:
                                users = _context3.sent;

                                if (!(users.length === 0)) {
                                    _context3.next = 7;
                                    break;
                                }

                                _admin = new _user2.default(_admin3.default);
                                /*const adminUser = */
                                _context3.next = 7;
                                return _admin.save();

                            case 7:
                            case 'end':
                                return _context3.stop();
                        }
                    }
                }, _callee3, this);
            }));

            function seed(_x5, _x6) {
                return _ref3.apply(this, arguments);
            }

            return seed;
        }()

        // 添加用户

    }, {
        key: 'create_user',
        value: function () {
            var _ref4 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee4(ctx) {
                var _ctx$request$body, name, email, password, isexit;

                return _regenerator2.default.wrap(function _callee4$(_context4) {
                    while (1) {
                        switch (_context4.prev = _context4.next) {
                            case 0:
                                _ctx$request$body = ctx.request.body, name = _ctx$request$body.name, email = _ctx$request$body.email, password = _ctx$request$body.password;

                                if (!(!name || !password)) {
                                    _context4.next = 3;
                                    break;
                                }

                                return _context4.abrupt('return', ctx.render('error', {
                                    message: '用户或密码不能为空!',
                                    error: { status: 400 }
                                }));

                            case 3:
                                _context4.next = 5;
                                return _user2.default.findOne({ name: name, password: (0, _md2.default)(password) });

                            case 5:
                                isexit = _context4.sent;

                                if (!isexit) {
                                    _context4.next = 8;
                                    break;
                                }

                                return _context4.abrupt('return', ctx.render('error', {
                                    message: '该用户已存在!',
                                    error: { status: 400 }
                                }));

                            case 8:
                                _context4.next = 10;
                                return AdminUserModel.create({ name: name, email: email, password: (0, _md2.default)(password) });

                            case 10:
                                ctx.redirect('/');

                            case 11:
                            case 'end':
                                return _context4.stop();
                        }
                    }
                }, _callee4, this);
            }));

            function create_user(_x7) {
                return _ref4.apply(this, arguments);
            }

            return create_user;
        }()

        // 用户登录

    }, {
        key: 'signIn',
        value: function () {
            var _ref5 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee5(ctx) {
                var _ctx$request$body2, name, password, user;

                return _regenerator2.default.wrap(function _callee5$(_context5) {
                    while (1) {
                        switch (_context5.prev = _context5.next) {
                            case 0:
                                _ctx$request$body2 = ctx.request.body, name = _ctx$request$body2.name, password = _ctx$request$body2.password;
                                _context5.prev = 1;
                                _context5.next = 4;
                                return _user2.default.findOne({ username: name, password: (0, _md2.default)(password) });

                            case 4:
                                user = _context5.sent;

                                logger.info(user);

                                if (!user) {
                                    _context5.next = 8;
                                    break;
                                }

                                return _context5.abrupt('return', ctx.body = { status: "success", data: user });

                            case 8:
                                _context5.next = 14;
                                break;

                            case 10:
                                _context5.prev = 10;
                                _context5.t0 = _context5['catch'](1);

                                logger.error("登录失败");
                                return _context5.abrupt('return', ctx.body = { status: "failed", err: _context5.t0 });

                            case 14:
                            case 'end':
                                return _context5.stop();
                        }
                    }
                }, _callee5, this, [[1, 10]]);
            }));

            function signIn(_x8) {
                return _ref5.apply(this, arguments);
            }

            return signIn;
        }()

        // 用户退出

    }, {
        key: 'signOut',
        value: function () {
            var _ref6 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee6(ctx) {
                var user;
                return _regenerator2.default.wrap(function _callee6$(_context6) {
                    while (1) {
                        switch (_context6.prev = _context6.next) {
                            case 0:
                                _context6.prev = 0;
                                _context6.next = 3;
                                return _user2.default.findOne({ username: 'chen', password: (0, _md2.default)('chen') });

                            case 3:
                                user = _context6.sent;

                                logger.info(user);
                                ctx.body = JSON.stringify({ status: "success", data: user });
                                _context6.next = 13;
                                break;

                            case 8:
                                _context6.prev = 8;
                                _context6.t0 = _context6['catch'](0);

                                logger.error('err', _context6.t0);
                                ctx.status = 500; //状态 500
                                ctx.body = JSON.stringify({ status: 'failed' }); //返回错误状态

                            case 13:
                            case 'end':
                                return _context6.stop();
                        }
                    }
                }, _callee6, this, [[0, 8]]);
            }));

            function signOut(_x9) {
                return _ref6.apply(this, arguments);
            }

            return signOut;
        }()
    }]);

    return UserController;
}();

exports.default = UserController;
//# sourceMappingURL=userController.js.map