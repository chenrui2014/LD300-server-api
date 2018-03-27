/**
 * Created by chen on 17-8-21.
 */
require('./init');
const path=require('path');
const Koa=require('koa');
const passport=require('koa-passport');
const session=require('koa-session2');
const koaBody =require('koa-body');
const {Parser}=require('./log/log');
const logger ={};
Parser(logger,'app.js',{});
//const connect=require('./db');
let config =require('./config/index');
const router=require('./router');
const cors=require('koa2-cors');
//const StartUp =require('./servers/startup');
//const vHost=require('./host/virtual_host');

async function start() {
    const app = new Koa();

    app.use(cors());

    app.use((ctx, next) => {
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
        key: "adld",   //default "koa:sess"
    }));
// authentication
    require('./controllers/auth/LDPassport');
//passport
    app.use(passport.initialize());
    app.use(passport.session());

    app.use(router.routes())
        .use(router.allowedMethods());


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


    await app.listen(config.port, config.ip);

    logger.log('Web服务启动',{ip:config.ip,port:config.port});
}
exports=module.exports=start;