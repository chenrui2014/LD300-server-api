'use strict';

var VirtualHost = require('../../host/virtual_host');
var _ = require('lodash');

function run(ports, done) {
    _.forEach(ports, function (port) {
        var vh = new VirtualHost(port);
        /*        vh.on('reset',()=>{
                    setTimeout(()=>{
                        vh.send(VirtualHost.CMD.alarm,10);
                    },2000);
                });*/
        /*        vh.start().then(()=>{
                    vh.send(VirtualHost.CMD.normal);
                    setTimeout(()=>{
                        vh.send(VirtualHost.CMD.alarm,10);
                    },5000);
                }).catch(done);*/
        vh.start().then(function () {
            var l = function l() {
                vh.send(VirtualHost.CMD.normal);
                /* setTimeout(()=>{
                     vh.send(VirtualHost.CMD.alarm,10);
                     //setTimeout(l,3000);
                 },3000);*/
            };
            l();
        }).catch(done);
    });
    setInterval(function () {
        done;
    }, 2000033);
}

describe('xxx', function () {
    it('启动一台主机', function (done) {
        run([1], done);
    });
    it('启动两台主机，并同一时间报警统一位置', function (done) {
        run([1, 3], done);
    });

    it('启动四台主机，并同一时间报警统一位置', function (done) {
        run([2, 4, 6, 8], done);
    });
});
//# sourceMappingURL=virtual_host.test.js.map