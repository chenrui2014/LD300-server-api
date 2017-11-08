/**
 * Created by chen on 17-8-21.
 */
import path from 'path';
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import koaBody from 'koa-body';
import logger from './logger';
import connect from './db';
import babelPolyfill from 'babel-polyfill';
import config from './config';
import router from './router';
import cors from 'koa2-cors';
//import HostService from './services/HostService';
import StartUp from './servers/startup';
import vHost from './test/host/virtual_host';

const app = new Koa();

 app.use(cors())

app.use((ctx, next) => {
    // if (ctx.request.header.host.split(':')[0] === 'localhost' || ctx.request.header.host.split(':')[0] === '127.0.0.1') {
    //     ctx.set('Access-Control-Allow-Origin', '*')
    // } else {
    //     ctx.set('Access-Control-Allow-Origin', config.ip)
    // }

    ctx.set('Access-Control-Allow-Origin', '*');
    ctx.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
    ctx.set('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS')
    ctx.set('Access-Control-Allow-Credentials', true) // 允许带上 cookie
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

app.use(router.routes())
    .use(router.allowedMethods());


// app.use((ctx) => {
//
//     logger.info("server");
//     ctx.body = "hello,world";
// });

const s = new StartUp();
const vh = new vHost(1);
s.start();
vh.start();

(async() => {
    try {
        const connection = await connect();
        logger.info('connected to MongoDB %s:%s/%s', connection.host, connection.port, connection.name);
    }catch (error) {
        logger.error(error);
        process.exit(-1);
    }

    // var server = require('http').createServer(app.callback());
    // var io = require('socket.io')(server);
    // //
    // io.on('connection', function(socket){
    //     //HostService.startHostServer();
    //     // setInterval(function () {
    //     //     socket.emit('news', { hello: 'world' });
    //     // },10000)
    //     socket.emit('news', { hello: 'world' });
    //     socket.on('my other event', function (data) {
    //         console.log(data);
    //     });
    //     logger.info('Server start at %s:%s', config.ip, 3000);
    // });
    // await server.listen(3000, config.ip);

    await app.listen(config.port, config.ip);


    logger.info('Server start at %s:%s', config.ip, config.port);
})();

// app.listen(3000);