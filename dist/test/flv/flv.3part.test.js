'use strict';

var FlvDecoder = require('').Decoder;
var fs = require('fs');
var path = require('path');

describe('acc<==>flv', function () {
    it('将16000-acc从flv中提取出来', function (done) {
        var fpath = path.resolve('./test/data/acc2flv/audio_flv_onvif_aac_16000.test.flv');
        var fpathwrite = path.resolve('./test/data/acc2flv/audio_flv_onvif_aac_16000_2aac_adts.test.aac');
        var fout = fs.createWriteStream(fpathwrite, {
            flags: 'w',
            encoding: null,
            fd: null,
            mode: 438,
            autoClose: true
        });
        var file = fs.createReadStream(fpath);
        var decoder = new FlvDecoder();
        decoder.on('metadata', function (name, data) {
            // "name" is a String, "data" is an Object/Array
            console.error('"metadata" event %j %j', name, data);
        });
        decoder.on('audio', function (audio) {
            audio.pipe(fout);
        });

        decoder.on('error', function (err) {
            done(err);
        });

        decoder.on('finish', function () {
            done();
        });

        file.pipe(decoder);
    });
});
//# sourceMappingURL=flv.3part.test.js.map