'use strict';

require('../node_modules/H264.js/lib/WebModule');
var H264 = require('../node_modules/H264.js/lib/H264');
var fs = require('fs');

describe('看看H264的数据', function () {
    it('123', function (done) {
        var fd = fs.createReadStream("d:/h264.dat", {
            flags: 'r',
            encoding: null,
            fd: null,
            mode: 438,
            autoClose: false
        });
        var buff = null;
        fd.on('data', function (data) {
            if (!buff) {
                buff = Buffer.from(data);return;
            }
            buff = Buffer.concat([buff, data], buff.length + data.length);
        });
        fd.on('end', function () {
            console.log(JSON.stringify(H264.convertRawStreamToNALUnitObject(buff)));
            done();
        });
    });
});
//# sourceMappingURL=H264.test.js.map