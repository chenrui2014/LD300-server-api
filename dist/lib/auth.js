'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var passport = require('koa-passport');
var LocalStrategy = require('passport-local');
var BearerStrategy = require('passport-http-bearer');
var UserModel = require('../models/user.model');
var AccessToken = require('../models/accessToken');
// serialize user objects into the session
passport.serializeUser(function (user, done) {
    return done(null, user.username);
});
passport.deserializeUser(function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee(username, done) {
        var user;
        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        _context.next = 2;
                        return UserModel.findOne({ username: username });

                    case 2:
                        user = _context.sent;

                        done(null, user);

                    case 4:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, undefined);
    }));

    return function (_x, _x2) {
        return _ref.apply(this, arguments);
    };
}());

passport.use(new BearerStrategy(function () {
    var _ref2 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee2(token, done) {
        var accessToken;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        _context2.prev = 0;
                        _context2.next = 3;
                        return AccessToken.findOne({ token: token }).populate('user');

                    case 3:
                        accessToken = _context2.sent;

                        accessToken ? done(null, accessToken.user) : done(null, false, { type: 'error', message: '授权失败！' });
                        _context2.next = 10;
                        break;

                    case 7:
                        _context2.prev = 7;
                        _context2.t0 = _context2['catch'](0);

                        done(_context2.t0);

                    case 10:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, undefined, [[0, 7]]);
    }));

    return function (_x3, _x4) {
        return _ref2.apply(this, arguments);
    };
}()));

/**
 * 默认从 req.body 或者 req.query 中取出 username, password 字段
 * https://github.com/jaredhanson/passport-local/blob/master/lib/strategy.js#L49
 */
passport.use(new LocalStrategy(function () {
    var _ref3 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee3(username, password, done) {
        var user;
        return _regenerator2.default.wrap(function _callee3$(_context3) {
            while (1) {
                switch (_context3.prev = _context3.next) {
                    case 0:
                        _context3.prev = 0;
                        _context3.next = 3;
                        return UserModel.findOne({ username: username });

                    case 3:
                        user = _context3.sent;

                        if (user && user.validPassword(password)) {
                            done(null, user);
                        } else {
                            done(null, false);
                        }
                        _context3.next = 10;
                        break;

                    case 7:
                        _context3.prev = 7;
                        _context3.t0 = _context3['catch'](0);

                        done(_context3.t0);

                    case 10:
                    case 'end':
                        return _context3.stop();
                }
            }
        }, _callee3, undefined, [[0, 7]]);
    }));

    return function (_x5, _x6, _x7) {
        return _ref3.apply(this, arguments);
    };
}()));

exports.isBearerAuthenticated = function () {
    return passport.authenticate('bearer', { session: false });
};

exports.isLocalAuthenticated = function () {
    return passport.authenticate('local', { session: false });
};

exports.passport = passport;
//# sourceMappingURL=auth.js.map