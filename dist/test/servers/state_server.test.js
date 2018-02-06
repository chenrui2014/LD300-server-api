'use strict';

var StateServer = require('../../app/servers/host_state_server');
var Server = require('../../app/servers/host_server');
var http = require('http');
var expect = require('chai').expect;
var vHost = require('../../host/virtual_host');

describe('状态服务测试', function () {
    var server = void 0;
    before(function (done) {
        server = new Server();
        server.start([{ id: 1, port: '\\\\.\\COM2' }]).then(function () {
            done();
        }).catch(done);
    });
    after(function () {
        server.stop();
    });
    it('端口被暂用，启动失败', function (done) {
        var hserver = http.createServer(function (req, res) {
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end('okay');
        });
        hserver.listen('3001', function () {
            var s = new StateServer();
            s.start(server).catch(function (err) {
                expect(err.code).equal('EADDRINUSE');
                done();
            });
        });
    });
    it('启用并停止', function (done) {
        var s = new StateServer();
        s.start(server).then(function () {
            s.stop();
            var hserver = http.createServer(function (req, res) {
                res.writeHead(200, { 'Content-Type': 'text/plain' });
                res.end('okay');
            });
            hserver.listen('3001', function () {
                done();
            });
        }).catch(done);
    });

    describe('启动状态服务，提供前台测试', function () {
        var vh = null,
            s = null;
        before(function (done) {
            vh = new vHost(1);
            s = new StateServer();
            Promise.all([vh.start(), s.start(server)]).then(function () {
                done();
            }).catch(function () {
                done(false);
            });
        });
        after(function () {
            vh.stop();
            s.stop();
        });
        it('先报错，然后还原', function (done) {
            vh.send(vHost.CMD.alarm, 10);
            vh.on('reset', function (data) {
                expect(data.port).equal(1);
                setTimeout(done, 9000);
            });
            setTimeout(function () {
                server.clearAlarm(1).catch(done);
            }, 9000);
        });
    });
});
//# sourceMappingURL=state_server.test.js.map