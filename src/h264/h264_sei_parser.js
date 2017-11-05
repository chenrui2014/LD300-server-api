/**
 * Created by Luky on 2017/8/7.
 */

const Util=require('./h264_util');
const ExpGolomb=require('./golomb');

const SEI_type={
    BUFFERING_PERIOD: 0,   ///< buffering period (H.264, D.1.1)
    PIC_TIMING: 1,   ///< picture timing
    USER_DATA_REGISTERED: 4,   ///< registered user data as specified by Rec. ITU-T T.35
    USER_DATA_UNREGISTERED: 5,   ///< unregistered user data
    RECOVERY_POINT: 6,   ///< recovery point (frame # to decoder sync)
    FRAME_PACKING: 45,  ///< frame packing arrangement
    DISPLAY_ORIENTATION: 47,  ///< display orientation
    GREEN_METADATA: 56   ///< GreenMPEG information
};

class SEIParser{
    static get TYTES()
    {
        return SEI_type;
    }
    static parseSEI(nalu){
        let rbsp = Util.ebsp2rbsp(nalu);//不对所有内容解码
        let gb = new ExpGolomb(rbsp);
        gb.skipByte();
        let ret={};
        while (gb.bitsAvailable > 16 && gb.readUN(16,false)>0) {
            let type = 0;
            let size = 0;
            let next=0;

            do {
                if (gb.bitsAvailable < 8)
                    return ret;
                type += gb.readUN(8,false);
            } while (gb.readUByte() === 0xff);

            do {
                if (gb.bitsAvailable < 8)
                    return ret;
                size += gb.readUN(8,false);
            } while (gb.readUByte() === 0xff);

            if (size > gb.bitsAvailable/ 8) {
                console.error(`SEI type ${type} size ${8*size} truncated at ${gb.bitsAvailable}`);
                return ret;
            }
            next = gb.index + 8 * size;

            if(type===SEI_type.RECOVERY_POINT){
                SEIParser._decodeRecoveryPoint(ret,gb);
                gb.skipBits(next-gb.index);
            }
            else{
                gb.skipBits(8*size);
            }
            // FIXME check bits here
            gb.alignToByte();
        }

        return ret;
    }

    static _decodeRecoveryPoint(ssi,gb){
        ssi.recovery_point={recovery_frame_cnt:gb.readUEG()};
        gb.skipBits(4);
        return val;
    }

    static resetSEI(sei){
        sei.recovery_point={recovery_frame_cnt:1};
    }
}

exports=module.exports=SEIParser;