/**
 * Created by Luky on 2017/8/2.
 */

class NALU {

    constructor(data) {
        this.forbidden_bit = !!(data[0] & 0x80);//1bit
        this.nal_reference_idc = (data[0] & 0x60) >> 5;//2bit
        this.nal_unit_type = data[0] & 0x1f;
        this.key_frame=(this.nal_unit_type === NALU.TYPES.IDR);
        this.nal_unit_type_string=NALU.getTypeString(this.nal_unit_type);
    }

    static getTypeString(ut){
        switch(ut){
            case 1:case 19:return 'SLICE';
            case 2:case 3:case 4:return 'DB_';
            case 5:return 'IDR';
            case 6:return 'SEI';
            case 7:return 'SPS';
            case 8:return 'PPS';
            case 9:return 'AUD';
            default:return 'Other';
        }
    }

    static get TYPES() {
        return {
            'SLICE':1,
            'SLICE_NON_IDR':1,
            'DPA':2,
            'DPB':3,
            'DPC':4,
            'IDR':5,
            'SEI':6,
            'SPS':7,
            'PPS':8,
            'AUD':9,
            'END_SEQUENCE':10,
            'END_STREAM':11,
            'FILLER_DATA':12,
            'SPS_EXT':13,
            'AUXILIARY_SLICE':19
        };
    }

    static get NRI() {
        return {
            'DISPOS':0,
            'LOW': 1,
            'HIGH':2,
            'HIGHEST': 3
        };
    }

    get type() {
        return this.nal_unit_type;
    }

    get f(){
        return this.forbidden_bit;
    }

    get nri(){
        return this.nal_reference_idc;
    }

    get isKeyframe() {
        return this.key_frame;
    }
}

exports=module.exports=NALU;