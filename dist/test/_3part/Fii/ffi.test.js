'use strict';

var ffi = require('ffi');
var ref = require('ref');
var path = require('path');
var BYTEPtr = ref.refType('uchar');
var DHLib = require('../../../app/ipcs/dahua/dhnetsdk');
var expect = require('chai').expect;

var dllPath = path.join(__dirname, 'dll/FiiTest');
console.log(dllPath);

var fns = {
    'A': ['void', []],
    'callback_1': ['void', ['pointer']]
};
var CB = function CB(fn) {
    return ffi.Callback.apply(ffi, ['void', [BYTEPtr, 'int']].concat(fn));
};

var dll = ffi.Library(dllPath, fns);

describe('char', function () {
    xit('', function () {
        var x = Buffer.from('预置位1');
        console.log(x.toString('hex'));
    });
    it('预置位1', function () {
        var buffer = Buffer.from([212, 164, 214, 195, 181, 227, 49, 0]);
        expect('预置点1').equal(DHLib.utils.mbcs2Utf8(buffer));
    });
});

xdescribe('callback', function () {
    it('pointer alloc in nactive c', function (done) {
        var cb = CB(function (byteptr, size) {
            console.log('size:' + size);
            var buffer = ref.readPointer(byteptr.ref(), 0, 4);
            console.log(buffer[0]);
            console.log(buffer[1]);
            console.log(buffer[2]);
            console.log(buffer[3]);
            done();
        });
        dll.callback_1(cb);
        setTimeout(function () {
            cb;
        }, 1100000);
    });
});
//# sourceMappingURL=ffi.test.js.map