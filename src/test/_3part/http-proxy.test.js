const http = require('http');
const httpProxy =require('http-proxy');
let proxy = httpProxy.createProxyServer();
const url=require('url');

http.createServer(function (req, res) {
    console.log(`收到转发请求：${req.url}`);
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.write('request successfully proxied to: ' + req.url + '\n' + JSON.stringify(req.headers, true, 2));
    res.end();
}).listen(9008);

http.createServer((req,res)=> {
    console.log(`收到请求：${req.url}`);
    const uri=url.parse(req.url);
    if(uri.pathname.indexOf('/ipc/')!==0){
        this.warn('收到未知请求',{uri});
        res.setHeader('Content-Type','application/json; charset=utf-8');
        res.writeHead(404, {'Content-Type': 'text/plain'});
        res.write("服务未找到!");
        return res.end();
    }
    let proxyPort=41074;
    //this.log('请求转发',{'Location': `http://localhost:${proxyPort}` + req.url});
    //res.writeHead(302, {'Location': `http://localhost:${worker.port}` + req.url});
    //res.end();
    const target={ target: `http://localhost:${proxyPort}` };
    proxy.web(req, res,target ,(e)=>{
        this.error('转发出错',{innerError:e,target})
    });
}).listen(3000);