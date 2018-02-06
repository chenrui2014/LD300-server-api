'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var flv = require('../../app/flv/flv_encoder');
var WebSocket = require('ws');
var _ = require('lodash');
var url = require('url');
var assert = require('assert');
var Writable = require('stream').Writable;
var H264unPack = require('../../app/ipcs/dahua/_dh_h264_unpack');
var lineReader = require('line-reader');
var path = require('path');
var fs = require('fs');
//const H264_2FLV=require('../app/h264/h264_2flv');
var Cache = require('../../app/servers/cache/to_flv_cache');

var wOption = {
    flags: 'w',
    encoding: null,
    fd: null,
    mode: 438,
    autoClose: false
};

var Live = function () {
    function Live(done) {
        _classCallCheck(this, Live);

        this._port = 3000;
        this._path = '/live';
        this._open();
        this._rooms = [];
        this.done = done;
    }

    _createClass(Live, [{
        key: '_open',
        value: function _open() {
            var _this = this;

            var socket = this._server = new WebSocket.Server({
                port: this._port,
                //path:this._path,
                noServer: true,
                verifyClient: function verifyClient(info) {
                    console.log(info);
                    return true;
                }
            });
            socket.on('connection', function (ws, req) {
                var uri = url.parse(req.url, true);
                console.log('\u5BA2\u6237\u7AEF\u8FDE\u5165\uFF0Curl' + req.url);
                var roomIDRegExp = new RegExp(_this._path + '\\/(\\d+)', 'i');
                var ipcid = _.last(roomIDRegExp.exec(uri.path) || [-1]) - 0;
                var user = uri.query.id;
                ws.on('message', function (msg) {
                    console.log('\u6536\u5230\u5BA2\u6237\u7AEF\u6D88\u606F' + msg);
                });
                ws.on('close', function (code, reason) {
                    console.log('Websocket\u8FDE\u63A5\u5173\u95EDcode:' + code + ',reason' + reason + '\uFF0Cipcid:' + ipcid + ',user:' + user);
                });

                if (ws.readyState === WebSocket.OPEN) {
                    //let lfv=new H264_2FLV();
                    //lfv.open();
                    var cache = new Cache();
                    cache.addClient(function (data) {
                        ws.send(data);
                    });
                    var fp = path.resolve(__dirname, 'data/dh_h264_cb.txt');
                    //let fw2=fs.createWriteStream(`d:/dhipc_unpacked_2flv.flv`,wOption);
                    var unpack = new H264unPack(true);
                    unpack.pipe(cache); //.pipe(fw2);
                    lineReader.eachLine(fp, function (line, last) {
                        unpack.write(Buffer.from(line, 'hex'));
                        //console.log(line);
                        if (last) {
                            unpack.end();
                            //fw2.close();
                        }
                    });
                    //fw2.on('finsih',this.done);
                    cache.on('finsih', _this.done);
                    //server.on('finsih',done);
                }
            });
        }
    }]);

    return Live;
}();

describe('h264_2flv', function () {
    it('转FLV文件', function (done) {
        var server = new Live(done);
    });
});

xdescribe('flv-script部分', function () {
    it('参看', function () {
        var data = '00086475726174696f6e000000000000000000000577696474680040760000000000000006686569676874004072000000000000000d766964656f646174617261746500000000000000000000096672616d6572617465004059000000000000000c766964656f636f646563696400401c00000000000000057469746c65020010525453502053657373696f6e2f322e300007656e636f64657202000d4c61766635372e37352e313030000866696c6573697a65000000000000000000000009';
        console.log(Buffer.from(data, 'hex').toString('utf8'));
    });
});

xdescribe('FLVEncoder', function () {
    it('没关系，固定值获取下看看', function () {
        var x = flv.VedioTagAVCPackage_EndOfSequence().toString('hex');
        console.log(x);
        //0900000400000000000000020000000000000f
    });
});
//# sourceMappingURL=flvencoder.test.js.map