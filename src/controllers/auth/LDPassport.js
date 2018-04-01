import passport from 'koa-passport';
const md5 = require("md5");

const LocalStrategy = require('passport-local').Strategy
const UserService = require('../../services/userService');

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(async function(id, done) {
    try {
        const user = await UserService.find_one(id);
        done(null, user)
    } catch(err) {
        done(err)
    }
});

passport.use(new LocalStrategy(async function(username, password, done) {
    try {

        let user = await UserService.find_user({username:username,password:md5(password)});

        if(user && user.length > 0){
            done(null, user);
        }else{
            done(null, false)
        }
    } catch (err){
        done(err)
    }
}));