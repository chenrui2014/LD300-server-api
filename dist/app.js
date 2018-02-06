'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

//const StartUp =require('./servers/startup');
//const vHost=require('./host/virtual_host');

var start = function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
        var app;
        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        app = new Koa();


                        app.use(cors());

                        app.use(function (ctx, next) {
                            ctx.set('Access-Control-Allow-Origin', '*');
                            ctx.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
                            ctx.set('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
                            ctx.set('Access-Control-Allow-Credentials', true); // 允许带上 cookie
                            return next();
                        }).use(koaBody({
                            multipart: true,
                            strict: false,
                            formidable: {
                                uploadDir: path.join(__dirname, '../assets/uploads/tmp')
                            },
                            jsonLimit: '10mb',
                            formLimit: '10mb',
                            textLimit: '10mb'
                        }));

                        //session
                        app.use(session({
                            key: "SESSIONID" //default "koa:sess"
                        }));
                        // authentication
                        require('./controllers/auth/LDPassport');
                        //passport
                        app.use(passport.initialize());
                        app.use(passport.session());

                        app.use(router.routes()).use(router.allowedMethods());

                        // const koaStatic = require('koa-static');
                        //
                        // app.use(koaStatic(
                        //     path.join( __dirname,  './logs/monitors')
                        // ))

                        // app.use((ctx) => {
                        //
                        //     logger.info("server");
                        //     ctx.body = "hello,world";
                        // });


                        _context.next = 10;
                        return app.listen(config.port, config.ip);

                    case 10:

                        logger.log('Web服务启动', { ip: config.ip, port: config.port });

                    case 11:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this);
    }));

    return function start() {
        return _ref.apply(this, arguments);
    };
}();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

/**
 * Created by chen on 17-8-21.
 */
require('./init');
var path = require('path');
var Koa = require('koa');
var passport = require('koa-passport');
var session = require('koa-session2');
var koaBody = require('koa-body');

var _require = require('./log/log'),
    Parser = _require.Parser;

var logger = {};
Parser(logger, 'app.js', {});
//const connect=require('./db');
var config = require('./config/index');
var router = require('./router');
var cors = require('koa2-cors');
exports = module.exports = start;
//# sourceMappingURL=app.js.map