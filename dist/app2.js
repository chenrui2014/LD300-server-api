'use strict';

var Koa = require('koa');
var path = require('path');
var staticSer = require('koa-static');
var cors = require('koa2-cors');

var app = new Koa();

// 静态资源目录对于相对入口文件index.js的路径
var staticPath = '../assets/monitors';

app.use(cors());

app.use(staticSer(path.join(__dirname, staticPath)));

// app.use( async ( ctx ) => {
//   ctx.body = 'hello world'
// })

app.listen(8088, function () {
    console.log('[demo] static-use-middleware is starting at port 8088');
});
//# sourceMappingURL=app2.js.map