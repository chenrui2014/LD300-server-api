'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Created by Luky on 2017/7/11.
 */

var expect = require('chai').expect;
var SerialPort = require('serialport');
var _ = require('lodash');
var assert = require('assert');

var options = {
    "baudRate": 9600,
    "stopBits": 1,
    "dataBits": 8,
    autoOpen: false
};

var _508PTZ = function () {
    function _508PTZ(com) {
        _classCallCheck(this, _508PTZ);

        this._com = com;
    }

    _createClass(_508PTZ, [{
        key: 'run',
        value: function run(cb) {
            var port = this._port = new SerialPort(this._com, options);
            var buffer = Buffer.alloc(0);
            function write(resp) {
                port.write(resp, function (err) {
                    if (err) console.error('V:508\u8F6C\u53F0\u56DE\u6267\u5F02\u5E38:' + err + ',\u4FE1\u606F' + resp.toString('hex'));
                    console.log('V:508\u8F6C\u53F0\u56DE\u6267\u6210\u529F,\u547D\u4EE4[' + Buffer.from(resp).toString('hex') + ']');
                });
            }
            var receive = function receive(data) {
                console.log('V:\u865A\u62DF508\u8BBE\u5907\u6536\u5230\u547D\u4EE4[' + Buffer.from(data).toString('hex') + ']');
                buffer = Buffer.concat([buffer, data]);
                //buffer=Buffer.concat([buffer,data,Buffer.from([0xaf])]);
                while (true) {
                    var i = 0;
                    while (i < buffer.length && buffer[i] !== 0xA1 && buffer[i] !== 0xA2 && buffer[i] !== 0xFF) {
                        i++;
                    }
                    if (i > 0) buffer = buffer.slice(i);
                    //apertureDec a2 00 09 49 4d 00 00 af af
                    if (buffer.length === 8 && buffer[3] === 0x49 && buffer[4] === 0x4d) {
                        buffer = Buffer.concat([buffer, Buffer.from([0xaf])]);
                    }
                    if (buffer.length < 9 && buffer[i] !== 0xFF) return;
                    if (buffer[i] === 0xFF) {
                        assert.ok(Buffer.from(buffer.slice(0, 7)).equals(Buffer.from(new Buffer([0xFF, 0x01, 0x00, 0x09, 0x00, 0x02, 45]))));
                        buffer = buffer.slice(7);
                        console.log('V:解析出自动聚焦回执');
                    }

                    if (buffer[0] === 0xA1 && buffer.length >= 0xF) {
                        assert.equal(buffer[0xE], 0xAF);

                        if (buffer[3] === 0x50 && buffer[4] === 0x32) {
                            console.log('V:解析出伺服移动指令');
                            var resp = new Buffer([0xA1, 0x00, 0x0B, 0x45, 0x60, 0x00, 0x00, 0x00, 0x00, 0x00, 0xAF]);
                            xor(resp, 9);
                            write(resp);
                        }
                        buffer = buffer.slice(0xF);
                    }

                    if (buffer[0] === 0xA1 && buffer.length >= 0x0B) {
                        assert.equal(buffer[0xA], 0xAF);

                        if (buffer[3] === 0x50 && buffer[4] === 0x30) {
                            console.log('V:解析出伺服移动指令');
                        } else if (buffer[3] === 0x51 && buffer[4] === 0x52) {
                            console.log('V:解析出查询启动命令');
                        } else if (buffer[3] === 0x51 && buffer[4] === 0x50) {
                            console.log('V:解析出查询位置命令');
                            var _resp = new Buffer([0xA1, 0x00, 0x0B, 0x30, 0x58, 0x00, 0x00, 0x00, 0x01, 0x00, 0xAF]);
                            xor(_resp, 9);
                            var resp2 = new Buffer([0xA1, 0x00, 0x0B, 0x30, 0x59, 0x00, 0x00, 0x00, 0x01, 0x00, 0xAF]);
                            xor(resp2, 9);
                            write(Buffer.concat([_resp, resp2], 22));
                        }
                        buffer = buffer.slice(0xB);
                    }

                    if (buffer[i] === 0xA2 && buffer.length >= 9) {
                        assert.equal(buffer[8], 0xAF);
                        console.log('V:\u89E3\u6790\u51FA\u767D\u5149\u547D\u4EE4');
                        var _resp2 = buffer.slice(0, 9);
                        _resp2[5] = 0;_resp2[6] = 0;
                        xor(_resp2, 7);
                        write(_resp2);
                        buffer = buffer.slice(9);
                    }
                }
            };
            port.open(function (err) {
                if (err) {
                    cb(err);console.error('V:\u7AEF\u53E3\u6253\u5F00\u5F02\u5E38\uFF1A' + err);return;
                }
                console.log('V:虚拟508设备已打开');
                //const parser = port.pipe(new Delimiter({ delimiter:[0xAF] }));
                //const parser = port.pipe(new Delimiter());
                port.on('data', receive);
                cb();
            });
        }
    }, {
        key: 'stop',
        value: function stop(cb) {
            this._port.close(function (err) {
                if (err) {
                    console.error('V:\u7AEF\u53E3\u5173\u95ED\u5F02\u5E38\uFF1A' + err);cb(err);return;
                }
                cb();
                console.log('V:虚拟508设备已关闭');
            });
        }
    }]);

    return _508PTZ;
}();

function xor(buffer, pos) {
    var result = buffer[0];
    for (var x = 1; x < pos; x++) {
        result = result ^ buffer[x];
    }
    buffer[pos] = result;
}

exports = module.exports = _508PTZ;
//# sourceMappingURL=v_508.js.map