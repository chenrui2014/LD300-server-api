import passport from 'koa-passport';
import {Strategy} from 'passport-local';

import UserModel from '../../models/user.model';

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    UserModel.findById(id).then(function(user) {
        if (user) {
            done(null, user.get());
        } else {
            done(user.errors, null);
        }
    });
});

passport.use(new Strategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
}, function(req, username, password, done) {
    UserModel.findOne({
        attributes: [
            'id', 'username'
        ],
        where: {
            username: username
        }
    }).then(function(user) {
        if (!user) {
            return done(null, false, {message: 'Email does not exist'});
        }
        return done(null, user.get());
    }).catch(function() {
        return done(null, false);
    });
}));