'use strict';

var decoder = require('../../app/acc/acc_adts_decoder');
var fs = require('fs');
var path = require('path');
var ADTS2FLV = require('../../app/acc/adts2flv');

describe('adtsDecoder', function () {
    function t(_in, _out, done) {
        var fpath = path.resolve(_in);
        var fpathwrite = path.resolve(_out);
        var fout = fs.createWriteStream(fpathwrite, {
            flags: 'w',
            encoding: null,
            fd: null,
            mode: 438,
            autoClose: true
        });
        var file = fs.createReadStream(fpath);
        var d = new ADTS2FLV(file);
        d.pipe(fout);
        fout.on('finish', done);
    }
    it('ffmpeg转换后的acc转', function (done) {
        t('./test/data/acc2flv/audio_flv_onvif_aac_16000_2aac_adts.test.aac', './test/data/acc2flv/audio_flv_onvif_aac_16000_selfbuild.test.flv', done);
    });

    it('大华直接返回的acc转', function (done) {
        t('./test/data/acc2flv/audio_flv_16000.test.aac', './test/data/acc2flv/audio_flv_dahua_aac_16000_selfbuild.test.flv', done);
    });
});
//# sourceMappingURL=adt2flv.test.js.map