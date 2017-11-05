/**
 * Created by Luky on 2017/8/15.
 */

const ExpGolomb=require('../h264/golomb');

const freqs=[
    96000,88200,64000,48000,44100,32000,24000,22050,
    16000,12000,11025,8000 ,7350 ,0    ,0    ,0
];

class ADTSHeaderParser{
    static ParseADTSHeader(buf){
        let gb = new ExpGolomb(buf);
        if(buf.length<7) return {};
        if(gb.readUN(12)!==0xFFF) return {};
        let ret={};
        ret.ID=gb.readUN(1);
        gb.skipBits(2);//level
        ret.protection_absent=gb.readBoolean();
        ret.profile=gb.readUN(2);
        ret.freqIndex=gb.readUN(4);
        ret.freq=freqs[ret.freqIndex];
        gb.skipBits(1);//private_bit
        ret.channel=gb.readUN(3);
        gb.skipBits(4);//original_copy,home,copyright_1,copyright_2
        ret.acc_frame_length=gb.readUN(13);
        ret.acc_raw_data_length=ret.acc_frame_length-(ret.protection_absent?7:9);
        ret.acc_raw_data_index=ret.protection_absent?7:9;
        ret.fixedRate=gb.readUN(11)===0x7ff;
        ret.blocks=gb.readUN(2)+1;
        return ret;
    }
}

exports=module.exports=ADTSHeaderParser;
