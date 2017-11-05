const decoder=require('../../app/acc/acc_adts_decoder');
const fs = require('fs');
const path=require('path');
const ADTS2FLV=require('../../app/acc/adts2flv');

describe('adtsDecoder',()=>{
    function t(_in,_out,done) {
        let fpath=path.resolve(_in);
        let fpathwrite=path.resolve(_out);
        let fout=fs.createWriteStream(fpathwrite,{
            flags: 'w',
            encoding: null,
            fd: null,
            mode: 0o666,
            autoClose: true
        });
        let file=fs.createReadStream(fpath);
        let d=new ADTS2FLV(file);
        d.pipe(fout);
        fout.on('finish',done);
    }
    it('ffmpeg转换后的acc转',(done)=> {
        t('./test/data/acc2flv/audio_flv_onvif_aac_16000_2aac_adts.test.aac',
            './test/data/acc2flv/audio_flv_onvif_aac_16000_selfbuild.test.flv',
            done
        );
    });

    it('大华直接返回的acc转',(done)=> {
        t('./test/data/acc2flv/audio_flv_16000.test.aac',
            './test/data/acc2flv/audio_flv_dahua_aac_16000_selfbuild.test.flv',
            done
        );
    });
});