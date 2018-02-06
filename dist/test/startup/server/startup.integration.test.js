'use strict';

var config = require('../../../app/config/config');
config.runMode.type = 'integration';
var StartUp = require('../../../app/servers/startup');
var vHost = require('../../../host/virtual_host');
var Client = require('./client_socket');

var s = null,
    vh = null,
    vh2 = null,
    c = null;
var before = function before() {
    s = new StartUp();
    vh = new vHost(1);
    vh2 = new vHost(3);
    c = new Client(null, 3001);
    c.on('data', function (data) {
        for (var i = 0; i < data.length; i += 8) {
            if (data[i + 3] === 1) {
                //08003001 00000003
                c.write(Buffer.from('0800000000000002', 'hex'));break;
            }
        }
    });
    return Promise.all([vh.start(), s.start(), vh2.start()]);
};

var after = function after() {
    s.stop();
    c.stop();
    console.log('结束了');
    process.exit();
};

var run = function run() {
    c.start();
    var x = 0;
    var i = setInterval(function () {
        if (++x === 1) {
            vh.send(vHost.CMD.normal);
            vh2.send(vHost.CMD.normal);
        }
        if (x === 3) {
            vh.send(vHost.CMD.alarm, 120);
            clearInterval(i);
        }
    }, 400);
};

before().then(run);
setTimeout(after, 15000);
//# sourceMappingURL=startup.integration.test.js.map