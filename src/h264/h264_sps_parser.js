/**
 * Created by Luky on 2017/8/2.
 */


const Util=require('./h264_util');
const ExpGolomb=require('./golomb');

class SPSParser {

    static parseSPS(nalu) {
        let rbsp = Util.ebsp2rbsp(nalu);
        let gb = new ExpGolomb(rbsp);

        gb.skipBits(8);
        let profile_idc = gb.readUByte();  // profile_idc
        let profile_compatibility=gb.readBits(8);// constraint_set_flags[5] + reserved_zero[3]
        let level_idc = gb.readUByte();  // level_idc
        let seq_parameter_set_id=gb.readUEG();// seq_parameter_set_id

        let profile_string = SPSParser.getProfileString(profile_idc);
        let level_string = SPSParser.getLevelString(level_idc);
        let chroma_format_idc = 1;
        let chroma_format = 420;
        let chroma_format_table = [0, 420, 422, 444];
        let bit_depth = 8;
        /*
        100 ||  // High profile
        110 ||  // High10 profile
        122 ||  // High422 profile
        244 ||  // High444 Predictive profile
         44 ||  // Cavlc444 profile
         83 ||  // Scalable Constrained High profile (SVC)
         86 ||  // Scalable High Intra profile (SVC)
        118 ||  // Stereo High profile (MVC)
        128 ||  // Multiview High profile (MVC)
        138 ||  // Multiview Depth High profile (MVCD)
        144  // old High444 profile*/
        if (profile_idc === 44 || profile_idc === 83 || profile_idc === 86
            || profile_idc === 100 || profile_idc === 110 || profile_idc === 118
            || profile_idc === 122 || profile_idc === 128 ||profile_idc === 138
            || profile_idc === 144 ||profile_idc === 244
            ) {

            chroma_format_idc = gb.readUEG();
            if (chroma_format_idc === 3) {
                gb.readBits(1);  // separate_colour_plane_flag
            }
            if (chroma_format_idc <= 3) {
                chroma_format = chroma_format_table[chroma_format_idc];
            }

            bit_depth = gb.readUEG() + 8;  // bit_depth_luma_minus8
            gb.skipUEG();  // bit_depth_chroma_minus8
            gb.skipBits(1);  // qpprime_y_zero_transform_bypass_flag
            if (gb.readBoolean()) {  // seq_scaling_matrix_present_flag
                let scaling_list_count = (chroma_format_idc !== 3) ? 8 : 12;
                for (let i = 0; i < scaling_list_count; i++) {
                    if (gb.readBoolean()) {  // seq_scaling_list_present_flag
                        if (i < 6) {
                            SPSParser._skipScalingList(gb, 16);
                        } else {
                            SPSParser._skipScalingList(gb, 64);
                        }
                    }
                }
            }
        }
        let log2_max_frame_num=gb.readUEG()+4;
        
        let poc={};//poc
        let poc_type = poc.type=gb.readUEG();
        if (poc_type === 0) {
            poc.log2_max_poc_lsb=gb.readUEG()+4;//log2_max_poc_lsb_minus4
            poc.max_poc_lsb=1<<(poc.log2_max_poc_lsb);
        }
        else if (poc_type === 1) {
            poc.delta_pic_order_always_zero_flag=gb.readBoolean();
            poc.offset_for_non_ref_pic=gb.readSEG();
            poc.offset_for_top_to_bottom_field=gb.readSEG();
            poc.num_ref_frames_in_poc_cycle = gb.readUEG();
            poc.offset_for_ref_frame=[];
            poc.expected_delta_per_poc_cycle=0;
            for (let i = 0; i < poc.num_ref_frames_in_poc_cycle; i++) {
                poc.expected_delta_per_poc_cycle+=(poc.offset_for_ref_frame[i]=gb.readSEG());
            }
        }

        let max_num_ref_frames=gb.readUEG();//max_num_ref_frames
        gb.skipBits(1);//gaps_in_frame_num_value_allowed_flag

        let pic_width_in_mbs_minus1 = gb.readUEG();
        let pic_height_in_map_units_minus1 = gb.readUEG();

        let frame_mbs_only_flag = gb.readBits(1);
        let mb_adaptive_frame_field_flag=false;
        if (frame_mbs_only_flag === 0) {
            mb_adaptive_frame_field_flag=gb.readBoolean();  // mb_adaptive_frame_field_flag
        }
        gb.skipBits(1);  // direct_8x8_inference_flag

        let frame_crop_left_offset = 0;
        let frame_crop_right_offset = 0;
        let frame_crop_top_offset = 0;
        let frame_crop_bottom_offset = 0;

        let frame_cropping_flag = gb.readBoolean();//剪切图像
        if (frame_cropping_flag) {
            frame_crop_left_offset = gb.readUEG();
            frame_crop_right_offset = gb.readUEG();
            frame_crop_top_offset = gb.readUEG();
            frame_crop_bottom_offset = gb.readUEG();
        }

        let sar_width = 1, sar_height = 1;
        let fps = 0, fps_fixed = true, fps_num = 0, fps_den = 0;

        let vui_parameters_present_flag = gb.readBoolean();
        if (vui_parameters_present_flag) {
            if (gb.readBoolean()) {  // aspect_ratio_info_present_flag
                let aspect_ratio_idc = gb.readByte();
                let sar_w_table = [1, 12, 10, 16, 40, 24, 20, 32, 80, 18, 15, 64, 160, 4, 3, 2];
                let sar_h_table = [1, 11, 11, 11, 33, 11, 11, 11, 33, 11, 11, 33,  99, 3, 2, 1];

                if (aspect_ratio_idc > 0 && aspect_ratio_idc < 16) {
                    sar_width = sar_w_table[aspect_ratio_idc - 1];
                    sar_height = sar_h_table[aspect_ratio_idc - 1];
                } else if (aspect_ratio_idc === 255) {
                    sar_width = gb.readByte() << 8 | gb.readByte();
                    sar_height = gb.readByte() << 8 | gb.readByte();
                }
            }

            if (gb.readBoolean()) {  // overscan_info_present_flag
                gb.skipBit();  // overscan_appropriate_flag
            }
            if (gb.readBoolean()) {  // video_signal_type_present_flag
                gb.skipBits(4);  // video_format & video_full_range_flag
                if (gb.readBoolean()) {  // colour_description_present_flag
                    gb.skipBits(24);  // colour_primaries & transfer_characteristics & matrix_coefficients
                }
            }
            if (gb.readBoolean()) {  // chroma_loc_info_present_flag
                gb.skipUEG();  // chroma_sample_loc_type_top_field
                gb.skipUEG();  // chroma_sample_loc_type_bottom_field
            }
            if (gb.readBoolean()) {  // timing_info_present_flag
                let num_units_in_tick = gb.readBits(32);
                let time_scale = gb.readBits(32);
                fps_fixed = gb.readBoolean();  // fixed_frame_rate_flag

                fps_num = time_scale;
                fps_den = num_units_in_tick * 2;
                fps = fps_num / fps_den;
            }
        }

        let sarScale = 1;
        if (sar_width !== 1 || sar_height !== 1) {
            sarScale = sar_width / sar_height;
        }

        let crop_unit_x = 0, crop_unit_y = 0;
        if (chroma_format_idc === 0) {
            crop_unit_x = 1;
            crop_unit_y = 2 - frame_mbs_only_flag;
        } else {
            let sub_wc = (chroma_format_idc === 3) ? 1 : 2;
            let sub_hc = (chroma_format_idc === 1) ? 2 : 1;
            crop_unit_x = sub_wc;
            crop_unit_y = sub_hc * (2 - frame_mbs_only_flag);
        }

        let codec_width = (pic_width_in_mbs_minus1 + 1) * 16;
        let codec_height = (2 - frame_mbs_only_flag) * ((pic_height_in_map_units_minus1 + 1) * 16);

        codec_width -= (frame_crop_left_offset + frame_crop_right_offset) * crop_unit_x;
        codec_height -= (frame_crop_top_offset + frame_crop_bottom_offset) * crop_unit_y;

        let present_width = Math.ceil(codec_width * sarScale);

        gb.destroy();
        gb = null;

        return {
            profile_idc:profile_idc,
            profile_compatibility:profile_compatibility,
            sps_id:seq_parameter_set_id,
            profile_string: profile_string,  // baseline, high, high10, ...
            level_idc:level_idc,
            level_string: level_string,  // 3, 3.1, 4, 4.1, 5, 5.1, ...
            bit_depth: bit_depth,  // 8bit, 10bit, ...
            chroma_format_idc:chroma_format_idc,
            chroma_format: chroma_format,  // 4:2:0, 4:2:2, ...
            chroma_format_string: SPSParser.getChromaFormatString(chroma_format),
            frame_mbs_only_flag:frame_mbs_only_flag,
            mb_adaptive_frame_field_flag:mb_adaptive_frame_field_flag,
            max_num_ref_frames:max_num_ref_frames,
            log2_max_frame_num:log2_max_frame_num,
            poc:poc,
            frame_rate: {
                fixed: fps_fixed,
                fps: fps,
                fps_den: fps_den,
                fps_num: fps_num
            },

            sar_ratio: {
                width: sar_width,
                height: sar_height
            },

            codec_size: {
                width: codec_width,
                height: codec_height
            },

            present_size: {
                width: present_width,
                height: codec_height
            }
        };
    }

    static _skipScalingList(gb, count) {
        let last_scale = 8, next_scale = 8;
        let delta_scale = 0;
        for (let i = 0; i < count; i++) {
            if (next_scale !== 0) {
                delta_scale = gb.readSEG();
                next_scale = (last_scale + delta_scale + 256) % 256;
            }
            last_scale = (next_scale === 0) ? last_scale : next_scale;
        }
    }

    static getProfileString(profile_idc) {
        switch (profile_idc) {
            case 66:
                return 'Baseline';
            case 77:
                return 'Main';
            case 88:
                return 'Extended';
            case 100:
                return 'High';
            case 110:
                return 'High10';
            case 122:
                return 'High422';
            case 244:
                return 'High444';
            default:
                return 'Unknown';
        }
    }

    static getLevelString(level_idc) {
        return (level_idc / 10).toFixed(1);
    }

    static getChromaFormatString(chroma) {
        switch (chroma) {
            case 420:
                return '4:2:0';
            case 422:
                return '4:2:2';
            case 444:
                return '4:4:4';
            default:
                return 'Unknown';
        }
    }

}

exports=module.exports=SPSParser;