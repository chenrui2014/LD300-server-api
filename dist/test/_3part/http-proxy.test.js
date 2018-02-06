'use strict';

var http = require('http');
var httpProxy = require('http-proxy');
var proxy = httpProxy.createProxyServer();
var url = require('url');

http.createServer(function (req, res) {
    console.log('\u6536\u5230\u8F6C\u53D1\u8BF7\u6C42\uFF1A' + req.url);
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.write('request successfully proxied to: ' + req.url + '\n' + JSON.stringify(req.headers, true, 2));
    res.end();
}).listen(9008);

http.createServer(function (req, res) {
    console.log('\u6536\u5230\u8BF7\u6C42\uFF1A' + req.url);
    var uri = url.parse(req.url);
    if (uri.pathname.indexOf('/ipc/') !== 0) {
        undefined.warn('收到未知请求', { uri: uri });
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.write("服务未找到!");
        return res.end();
    }
    var proxyPort = 41074;
    //this.log('请求转发',{'Location': `http://localhost:${proxyPort}` + req.url});
    //res.writeHead(302, {'Location': `http://localhost:${worker.port}` + req.url});
    //res.end();
    var target = { target: 'http://localhost:' + proxyPort };
    proxy.web(req, res, target, function (e) {
        undefined.error('转发出错', { innerError: e, target: target });
    });
}).listen(3000);
//# sourceMappingURL=http-proxy.test.js.map