/**
 * Created by Luky on 2017/8/2.
 */

const Util=require('./h264_util');
const ExpGolomb=require('./golomb');
const NALU=require('./h264_nalu_parser');
const assert=require('assert');
const PPSParser=require('./h264_pps_parser');
const MAX_MMCO_COUNT=66;

const encodeType={
    TOP_FIELD:1,
    BOTTOM_FIELD:2,
    FRAME:3,
    AUTO:4
};

const Types={
    'P':0,
    'B':1,
    'I':2,
    'SP':3,
    'SI':4,
    'P_ONLY':5,
    'B_ONLY':6,
    'I_ONLY':7,
    'SP_ONLY':8,
    'SI_ONLY':9
};

/**
 * Memory management control operation opcode.
 */
const MMCOOpcode ={
    'MMCO_END' :0,
    'MMCO_SHORT2UNUSED':1,
    'MMCO_LONG2UNUSED':2,
    'MMCO_SHORT2LONG':3,
    'MMCO_SET_MAX_LONG':4,
    'MMCO_RESET':5,
    'MMCO_LONG':6
} ;

class H264SliceParser{
    static get EncodeTypes(){
        return encodeType;
    }

    static _parseSliceHeader(nalu,sps_table,pps_table,sei){
        let rbsp = Util.ebsp2rbsp(nalu.slice(0,60));//不对所有内容解码
        let gb = new ExpGolomb(rbsp);
        let nal=new NALU(nalu);
        gb.skipBits(8);
        let slice={};
        gb.skipUEG();//first_mb_in_slice当前slice中包含的第一个宏块在整帧中的位置
        let type=slice.slice_type=gb.readUEG();//当前slice的类型
        if(type>=5)type-=5;
        slice.slice_string=H264SliceParser.getFrameTypeString(slice.slice_type);
        slice.pps_id=gb.readUEG();//当前slice所依赖的pps的id

        let pps=/*slice.pps = */pps_table[slice.pps_id];
        let sps=/*slice.sps = */sps_table[pps.sps_id];
        slice.sps_id=pps.sps_id;

        slice.pic_num=slice.frame_num = gb.readUN(sps.log2_max_frame_num); // was u(v)
        slice.max_pic_num=1<<sps.log2_max_frame_num;//frame_num能达到的最大值，最大值后变成0
        slice.field_pic_flag=false;
        slice.encode_type=encodeType.FRAME;
        if(!sps.frame_mbs_only_flag)//全部是帧
        {
            //场编码标识位。当该标识位为1时表示当前slice按照场进行编码；
            //该标识位为0时表示当前slice是帧或者帧场混合模式
            slice.field_pic_flag = gb.readBoolean();
            if( slice.field_pic_flag )
            {
                slice.max_pic_num*=2;
                slice.pic_num=2*slice.pic_num+1;//场模式下，当前总是+1，另外个总是+0
                slice.bottom_field_flag = gb.readBoolean();//底场标识位。该标志位为1表示当前slice是某一帧的底场；为0表示当前slice为某一帧的顶场
                sps.encode_type=slice.bottom_field_flag?encodeType.BOTTOM_FIELD:encodeType.TOP_FIELD;
            }
            else if(sps.mb_adaptive_frame_field_flag){
                console.error('帧场自适应编码方式不适用');
                //sps.encode_type=encodeType.AUTO;
            }
        }

        slice.key_frame=false;
        if( nal.isKeyframe)
        {
            slice.key_frame=true;
            slice.idr_pic_id = gb.readUEG();//表示IDR帧的序号。某一个IDR帧所属的所有slice，其idr_pic_id应保持一致。该值的取值范围为[0,65535]
        }
        sei=sei||{};
        if('recovery_point' in sei&&sei.recovery_point.recovery_frame_cnt >= 0){
            slice.key_frame=true;
        }

        if(sps.max_num_ref_frames<=1&&pps.ref_count[0]<=1&&type===Types.I){
            slice.key_frame=true;
        }

        slice.poc={};
        if( sps.poc.type === 0 )
        {
            slice.poc.lsb = gb.readUN(sps.poc.log2_max_poc_lsb); // was u(v)
            slice.poc.delta_bottom=0;
            if( pps.pic_order_present_flag && !slice.field_pic_flag )
            {
                slice.poc.delta_bottom = gb.readSEG();
            }
        }
        if( sps.poc.type === 1 && !sps.delta_pic_order_always_zero_flag )
        {
            slice.poc.delta= [gb.readSEG()];
            if( pps.pic_order_present_flag && !slice.field_pic_flag )
            {
                slice.poc.delta[ 1 ] = gb.readSEG();
            }
        }

        slice.got_reset=false;
        if(nal.nri>0&&!nal.isKeyframe){
            slice.got_reset=H264SliceParser._scanMMCOReset(slice,sps,pps,gb)===1;
        }
        return slice;
        /*

        return [sh,gb];*/
    }

    static _parseRefCount(slice,pps,gb){
        slice.ref_count=[pps.ref_count[0],pps.ref_count[1]];
        let type=slice.slice_type;
        if(type>=5)type-=5;
        if(type!==Types.I&&type!==Types.SI)
        {
            let max=[];
            max[0]=max[1]=(slice.encode_type>=encodeType.FRAME?15:31);
            let num_ref_idx_active_override_flag = gb.readBoolean();
            if(num_ref_idx_active_override_flag )
            {
                slice.ref_count[0]= gb.readUEG()+1;//num_ref_idx_l0_active_minus1
                if(type===Types.B)
                    slice.ref_count[1]= gb.readUEG()+1;//num_ref_idx_l1_active_minus1
                else slice.ref_count[1]=1;
            }
            if (slice.ref_count[0] - 1 > max[0] || slice.ref_count[1] - 1 > max[1]) {
                console.error(`reference overflow ${slice.ref_count[0] - 1} > ${max[0]} or ${slice.ref_count[1] - 1} > ${max[1]}`);
                slice.ref_count[0] = slice.ref_count[1] = 0;
                return -1;
            }
            return 0;
        }
        slice.ref_count[0]=slice.ref_count[1]=0;
        return 0;
    }

    static _skipPredWeightTable(slice,sps,gb){
        gb.skipUEG();
        let chroma_format_idc=sps.chroma_format_idc;
        if (chroma_format_idc>0)gb.skipUEG();

        for (let list = 0; list < 2; list++) {
            for (let i = 0; i < slice.ref_count[list]; i++) {
                if (gb.readBoolean()) {
                    let luma_weight0=gb.readSEG();
                    let luma_weight1=gb.readSEG();
                    if (luma_weight0>127||luma_weight0<-128
                        ||luma_weight1>127||luma_weight1<-128)
                        return -1;
                }

                if (chroma_format_idc>0) {
                    if (gb.readBoolean()) {
                        for (let j = 0; j < 2; j++) {
                            let chroma_weight0= gb.readSEG();
                            let chroma_weight1= gb.readSEG();
                            if (chroma_weight0>127||chroma_weight0<-128
                                ||chroma_weight1>127||chroma_weight1<-128)
                                return -1;
                        }
                    }
                }
            }
            if ( slice.slice_type!==Types.B)
                break;
        }
        return 0;
    }

    static isSliceB(slice){
        return slice.slice%5===Types.B;
    }

    static _readRefPicListReorderingi(slice,gb){
        let ref_pic_list_reordering_flag_l0_or_11 = gb.readBoolean();

        if( ref_pic_list_reordering_flag_l0_or_11)
        {
            let reordering_of_pic_nums_idc;
            do
            {
                if((reordering_of_pic_nums_idc = gb.readUEG())>3){
                    console.error(`illegal reordering_of_pic_nums_idc ${reordering_of_pic_nums_idc}`);
                    return -1;
                }
                gb.skipUEG();
            } while(reordering_of_pic_nums_idc !== 3 && gb.bitsAvailable>0);
        }
        return 0;
    }

    static _readRefPicListReordering(slice,gb){
        let type=slice.slice_type;
        if(type>=5)type-=5;
        if(type!==Types.I&&type!==Types.SI)
            H264SliceParser._readRefPicListReorderingi(slice,gb);
        if(type===Types.B)
            H264SliceParser._readRefPicListReorderingi(slice,gb);
    }

    static _scanMMCOReset(slice,sps,pps,gb){
        if( pps.redundant_pic_cnt_present_flag )
            gb.skipUEG();//redundant_pic_cnt
        let type=slice.slice_type;
        if(type>=5)type-=5;
        if( type===Types.B)
            gb.skipBit();//direct_spatial_mv_pred_flag

        let lct=H264SliceParser._parseRefCount(slice,pps,gb);
        if(lct<0) return false;
        H264SliceParser._readRefPicListReordering(slice,gb);

        if( ( pps.weighted_pred_flag &&(type===Types.P||type===Types.SP))
            ||( pps.weighted_bipred_idc === 1 && type===Types.B )  )
        {
            H264SliceParser._skipPredWeightTable(h, b);
        }

        if (!gb.readBoolean()) { // adaptive_ref_pic_marking_mode_flag
            return 0;
        }

        for (let i = 0; i < MAX_MMCO_COUNT; i++) {
            let opcode = gb.readUEG();
            //memory_management_control_operation
            if (opcode > MMCOOpcode.MMCO_LONG) {
                console.error(`illegal memory management control operation ${opcode}`);
                return -1;
            }
            if (opcode === MMCOOpcode.MMCO_END)
                return 0;
            else if (opcode === MMCOOpcode.MMCO_RESET)
                return 1;
            gb.readUEG();
            if (opcode === MMCOOpcode.MMCO_SHORT2LONG) gb.readUEG();
        }

        return 0;
    }

    static getFrameTypeString(id) {
        switch (id) {
            case 0:
                return 'P';
            case 1:
                return 'B';
            case 2:
                return 'I';
            case 3:
                return 'SP';
            case 4:
                return 'SI';
            case 5:
                return 'P_ONLY';
            case 6:
                return 'B_ONLY';
            case 7:
                return 'I_ONLY';
            case 8:
                return 'SP_ONLY';
            case 9:
                return 'SI_ONLY';
            default:
                return 'Unknown';
        }
    }

    static TYPES(){
        return Types;
    }

    static parseSlice(nalu,sps_table,pps_table,sei){
        let slice=H264SliceParser._parseSliceHeader(nalu,sps_table,pps_table,sei);

        //数据部分不解析
/*        if(gb.bitsAvailable>0){
            gb.skipBits(1);// CABAC-specific: skip alignment bits, if there are any
        }
        slice.sliceStart=gb._index;
        slice.sliceEnd=gb.bitsAvailable;

        // FIXME should read or skip data
        //slice_data( ); /!* all categories of slice_data( ) syntax *!/
        H264SliceParser._skipRBSPSliceTrailingBits(gb,slice.pps);*/
        return slice;
    }
/*

    static _skipRBSPSliceTrailingBits(gb,pps){
        PPSParser.skipRBSPTrailingBits(gb);
        if( pps.entropy_coding_mode_flag )
        {
            while( gb.bitsAvailable>0)
            {
                assert.ok(0===gb.readUN(16)); // equal to 0x0000
            }
        }
    }
*/
}

exports=module.exports=H264SliceParser;