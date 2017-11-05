const FlvDecoder=require('').Decoder;
const fs = require('fs');
const  path=require('path');

describe('acc<==>flv',()=> {
    it('将16000-acc从flv中提取出来', (done) => {
        let fpath = path.resolve('./test/data/acc2flv/audio_flv_onvif_aac_16000.test.flv');
        let fpathwrite = path.resolve('./test/data/acc2flv/audio_flv_onvif_aac_16000_2aac_adts.test.aac');
        let fout = fs.createWriteStream(fpathwrite, {
            flags: 'w',
            encoding: null,
            fd: null,
            mode: 0o666,
            autoClose: true
        });
        let file = fs.createReadStream(fpath);
        let decoder = new FlvDecoder();
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

        decoder.on('finish', () => {
            done();
        });

        file.pipe(decoder);
    });

});