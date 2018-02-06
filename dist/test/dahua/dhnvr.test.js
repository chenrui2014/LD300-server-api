'use strict';

/**
 * Created by Luky on 2017/7/2.
 */
var DHNVR = require('../../app/ipcs/dahua/_dh_nvr');
var jIPC = require('../data/_dhnvr.json');
var expect = require('chai').expect;

describe('大华nvr测试', function () {
    xit('nvr连接测试', function (done) {
        var ipc = new DHNVR(jIPC);
        ipc.connect(function (err) {
            expect(!err).equal(true);
            expect(ipc.isConnected).equal(true);
            ipc.disConnect(done);
        });
    });
    it('视频流测试', function (done) {
        var ipc = new DHNVR(jIPC);
        ipc._realPlay(function (err, id /*,code,buf,size*/) {
            expect(!err).equal(true);
            console.log('接受到数据');
        });
        setTimeout(function () {
            ipc._stopRealPlay(function (err) {
                expect(!err).equal(true);
                ipc.disConnect(done);
            });
        }, 2000);
    });
});
//# sourceMappingURL=dhnvr.test.js.map