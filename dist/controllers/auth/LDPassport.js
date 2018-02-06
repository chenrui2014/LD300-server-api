'use strict';

var _koaPassport = require('koa-passport');

var _koaPassport2 = _interopRequireDefault(_koaPassport);

var _passportLocal = require('passport-local');

var _user = require('../../models/user.model');

var _user2 = _interopRequireDefault(_user);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_koaPassport2.default.serializeUser(function (user, done) {
    done(null, user.id);
});

_koaPassport2.default.deserializeUser(function (id, done) {
    _user2.default.findById(id).then(function (user) {
        if (user) {
            done(null, user.get());
        } else {
            done(user.errors, null);
        }
    });
});

_koaPassport2.default.use(new _passportLocal.Strategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
}, function (req, username, password, done) {
    _user2.default.findOne({
        attributes: ['id', 'username'],
        where: {
            username: username
        }
    }).then(function (user) {
        if (!user) {
            return done(null, false, { message: 'Email does not exist' });
        }
        return done(null, user.get());
    }).catch(function () {
        return done(null, false);
    });
}));
//# sourceMappingURL=LDPassport.js.map