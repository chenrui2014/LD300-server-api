'use strict';

/**
 * Created by Luky on 2017/7/7.
 */

var f = require('../app/servers/ipc_factory');
require('../app/ipcs/ipc_addin');

xdescribe('厂家摄像头测试', function () {
    it('连接测试', function (done) {
        var ipc = f.getIPC(1);
        ipc.connect().then(function () {
            console.log('connected');
            ipc.disConnect().then(function () {
                console.log('disconnected');done();
            }).catch(done);
        }).catch(done);
    });
});

describe('组装摄像头测试', function () {
    it('onvif连接测试', function (done) {
        var ipc = f.getIPC(2);
        ipc.connect().then(function () {
            console.log('connected');
            ipc.disConnect().then(function () {
                console.log('disconnected');done();
            }).catch(done);
        }).catch(done);
    });
});
//# sourceMappingURL=ipc_factory.test.js.map