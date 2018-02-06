'use strict';

/**
 * Created by Luky on 2017/7/17.
 */

var HB = require('../../app/rtsp/rtsp_heartbeat');
var ONVIF = require('../../app/ipcs/onvif/onvif_ipc');
var cfg = require('../data/dhipc_onvif.json');
var expect = require('chai').expect;
var RtspClient = require('../../_3part/yellowstone/lib/index').RtspClient;

describe('RTSP心跳测试', function () {

    xit('yellowstone测试', function (done) {
        var ipc = new ONVIF(cfg);
        ipc._realPlay().then(function (uri) {
            var client = new RtspClient('admin', 'admin');
            client.connect(uri, { keepAlive: true }).then(function (details) {
                setTimeout(done, 2000);
                console.log(details);
            }).catch(done);
        }).catch(done);
    });

    it('abc', function (done) {
        var ipc = new ONVIF(cfg);
        ipc._realPlay().then(function (uri) {
            console.log('rtsp地址取回成功链接成功');
            var hb = new HB(uri, 'admin', 'admin');
            hb.listen();
            var i = 0;
            hb.on('online', function () {
                i++;
                if (i === 10) done();
                console.log('服务在线');
            });
            //手动拔网线测试
            hb.on('offline', function (e) {
                i++;
                console.error('服务掉线');
                done(e);
            });
        }).catch(done);
    });
});
//# sourceMappingURL=rtsp_heartbeat.test.js.map