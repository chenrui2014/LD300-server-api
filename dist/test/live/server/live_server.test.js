'use strict';

/**
 * Created by Luky on 2017/7/28.
 */
//let live=require('../app/servers/__live_server');
var live = require('../../../app/servers/live_server');
var factory = require('../../../app/servers/ipc_factory');
//let FLVDemuxer=require('../node_modules/flv.js/src/demux/flv-demuxer');
var fs = require('fs');
var http = require('http');
var wOption = {
    flags: 'w',
    encoding: null,
    fd: null,
    mode: 438,
    autoClose: true
};

var server = http.createServer();
server.listen(3000);

describe('集成测试', function () {

    function dolive(id, done) {
        var l = new live(server, id);
        l.open();
        l.on('close', function () {
            done();
        });
    }

    it('大华枪机视频sdk测试', function (done) {
        dolive(1, done);
    });

    it('大华枪机视频onvif测试', function (done) {
        dolive(2, done);
    });

    xit('hopewell枪机视频onvif测试', function (done) {
        dolive(3, done);
    });

    it('大华球机视频sdk测试', function (done) {
        dolive(4, done);
    });

    it('大华球机视频onvif测试', function (done) {
        dolive(5, done);
    });
});
//# sourceMappingURL=live_server.test.js.map