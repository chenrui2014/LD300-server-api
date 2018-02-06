'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Created by Luky on 2017/8/3.
 */

var Util = require('./h264_util');
var ExpGolomb = require('./golomb');
var SPSParser = require('./h264_sps_parser');
var assert = require('assert');

var PPSParser = function () {
    function PPSParser() {
        _classCallCheck(this, PPSParser);
    }

    _createClass(PPSParser, null, [{
        key: 'parsePPS',
        value: function parsePPS(nalu, SPSTable) {
            var rbsp = Util.ebsp2rbsp(nalu);
            var gb = new ExpGolomb(rbsp);

            gb.skipByte();
            var ret = {};
            ret.pps_id = gb.readUEG();
            ret.sps_id = gb.readUEG(); //seq_parameter_set_id
            gb.skipBit(); //entropy_coding_mode_flag
            ret.pic_order_present_flag = gb.readBoolean();
            ret.num_slice_groups_minus1 = gb.readUEG();

            if (ret.num_slice_groups_minus1 > 0) {
                console.error('FMO不受支持');
                ret.run_length_minus1 = [];
                ret.top_left = [];
                ret.bottom_right = [];
                var slice_group_map_type = ret.slice_group_map_type = gb.readUEG();
                if (slice_group_map_type === 0) {
                    for (var i_group = 0; i_group <= ret.num_slice_groups_minus1; i_group++) {
                        ret.run_length_minus1[i_group] = gb.readUEG();
                    }
                } else if (slice_group_map_type === 2) {
                    for (var _i_group = 0; _i_group < ret.num_slice_groups_minus1; _i_group++) {
                        ret.top_left[_i_group] = gb.readUEG();
                        ret.bottom_right[_i_group] = gb.readUEG();
                    }
                } else if (slice_group_map_type === 3 || slice_group_map_type === 4 || slice_group_map_type === 5) {
                    ret.slice_group_change_direction_flag = gb.readBits(1);
                    ret.slice_group_change_rate_minus1 = gb.readUEG();
                } else if (slice_group_map_type === 6) {
                    ret.slice_group_id = [];
                    ret.pic_size_in_map_units_minus1 = gb.readUEG();
                    for (var i = 0; i <= ret.pic_size_in_map_units_minus1; i++) {
                        ret.slice_group_id[i] = gb.readUN(ExpGolomb.intlog2(ret.num_slice_groups_minus1 + 1)); // was u(v)
                    }
                }
            }
            //num_ref_idx_l0_active_minus1,num_ref_idx_l1_active_minus1
            ret.ref_count = [gb.readUEG() + 1, gb.readUEG() + 1];
            assert.ok(ret.ref_count[0] - 1 <= 32 - 1 && ret.ref_count[1] - 1 <= 32 - 1);
            ret.weighted_pred_flag = gb.readBits(1);
            ret.weighted_bipred_idc = gb.readUN(2);
            gb.skipSEG(); //pic_init_qp_minus26
            gb.skipSEG(); //pic_init_qs_minus26
            gb.skipSEG(); //chroma_qp_index_offset
            gb.skipBits(2); //deblocking_filter_control_present_flag,constrained_intra_pred_flag
            ret.redundant_pic_cnt_present_flag = gb.readBits(1);

            /*        ret.more_rbsp_data_present =PPSParser.moreRBSPData(gb)===1;
                    if(ret.more_rbsp_data_present )
                    {
                        ret.transform_8x8_mode_flag = gb.readBoolean();
                        ret.pic_scaling_matrix_present_flag = gb.readBoolean();
                        ret.pic_scaling_list_present_flag=[];
                        if(ret.pic_scaling_matrix_present_flag )
                        {
                            for(let i = 0; i < 6 + 2* ret.transform_8x8_mode_flag; i++ )
                            {
                                ret.pic_scaling_list_present_flag[ i ] = gb.readBoolean(1);
                                /!*ret.ScalingList4x4=[];
                                ret.UseDefaultScalingMatrix4x4Flag=[];*!/
                                if(ret.pic_scaling_list_present_flag[ i ] )
                                {
                                    if( i < 6 )
                                    {
                                        SPSParser._skipScalingList(gb, 16);
                                    }
                                    else
                                    {
                                        SPSParser._skipScalingList(gb,64);
                                    }
                                }
                            }
                        }
                        ret.second_chroma_qp_index_offset = gb.readSEG();
                    }*/
            return ret;
        }

        /*    static moreRBSPData(gb)
            {
                if ( !gb.bitsAvailable) { return 0; }
                if ( gb.readBits(1,false)===1) { return 0; } // if next bit is 1, we've reached the stop bit
                return 1;
            }
        
            static skipRBSPTrailingBits(gb){
                assert.ok(gb.readBoolean());//rbsp_stop_one_bit
                while(gb.bitsAvailable!==8)
                {
                    assert.ok(!gb.readBoolean());//rbsp_alignment_zero_bit equal to 0
                }
            }*/

    }]);

    return PPSParser;
}();

exports = module.exports = PPSParser;
//# sourceMappingURL=h264_pps_parser.js.map