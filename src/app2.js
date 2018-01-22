const Koa = require('koa')
const path = require('path')
const staticSer = require('koa-static')

const app = new Koa()

// 静态资源目录对于相对入口文件index.js的路径
const staticPath = './logs/monitors'

app.use(staticSer(
    path.join( __dirname,  staticPath)
))


// app.use( async ( ctx ) => {
//   ctx.body = 'hello world'
// })

app.listen(8088, () => {
    console.log('[demo] static-use-middleware is starting at port 8088')
})