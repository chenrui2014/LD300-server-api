'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Created by Luky on 2017/8/6.
 */
var SliceParser = require('./h264_slice_parser');

var H264POC = function () {
    function H264POC() {
        _classCallCheck(this, H264POC);

        this._prev_frame_num = 0;
        this._prev_frame_num_offset = 0;
        this._prev_poc_lsb = 0;
        this._prev_poc_msb = 0;
    }

    _createClass(H264POC, [{
        key: 'initPOC',
        value: function initPOC(slice, sps) {
            if (sps.profile === '66') {
                //baseline
                sps.poc.sb = sps.frame_num;
                return;
            }
            if (slice.key_frame) {
                this._prev_frame_num = this._prev_frame_num_offset = this._prev_poc_lsb = this._prev_poc_msb = 0;
            }
            var field_poc = [];
            if (sps.poc.type === 0) {
                var max_poc_lsb = 1 << sps.log2_max_poc_lsb;
                if (slice.poc.lsb < this._prev_poc_lsb && this._prev_poc_lsb - slice.poc.lsb >= max_poc_lsb / 2) {
                    slice.poc.msb = this._prev_poc_msb + max_poc_lsb;
                } else if (slice.poc.lsb > this._prev_poc_lsb && this._prev_poc_lsb - slice.poc.lsb < -max_poc_lsb / 2) {
                    //乱序了
                    slice.poc.msb = this._prev_poc_msb - max_poc_lsb;
                } else {
                    slice.poc.msb = this._prev_poc_msb;
                }

                field_poc[0] = field_poc[1] = slice.poc.msb + slice.poc.lsb;
                if (slice.encode_type === SliceParser.EncodeTypes.FRAME) field_poc[1] += slice.poc.delta_bottom;
            } else {
                var max_frame_num = 1 << sps.log2_max_frame_num;
                slice.frame_num_offset = this._prev_frame_num_offset;
                if (slice.frame_num < this._prev_frame_num) slice.frame_num_offset += max_frame_num;
                if (sps.poc.type === 1) {
                    var abs_frame_num = 0;
                    var poc_cycle_length = sps.num_ref_frames_in_poc_cycle;
                    if (poc_cycle_length !== 0) abs_frame_num = slice.frame_num_offset + slice.frame_num;

                    if (slice.nalu.nal_reference_idc === 0 && abs_frame_num > 0) abs_frame_num--;

                    var expected_delta_per_poc_cycle = sps.poc.expected_delta_per_poc_cycle;

                    var expectedpoc = 0;
                    if (abs_frame_num > 0) {
                        var poc_cycle_cnt = (abs_frame_num - 1) / poc_cycle_length;
                        var frame_num_in_poc_cycle = (abs_frame_num - 1) % poc_cycle_length;

                        expectedpoc = poc_cycle_cnt * expected_delta_per_poc_cycle;
                        for (var i = 0; i <= frame_num_in_poc_cycle; i++) {
                            expectedpoc = expectedpoc + sps.offset_for_ref_frame[i];
                        }
                    }

                    if (slice.nalu.nal_reference_idc === 0) expectedpoc = expectedpoc + sps.offset_for_non_ref_pic;

                    field_poc[0] = expectedpoc + slice.poc.delta[0];
                    field_poc[1] = field_poc[0] + sps.offset_for_top_to_bottom_field;

                    if (slice.encode_type === SliceParser.EncodeTypes.FRAME) field_poc[1] += slice.poc.delta[1];
                } else {
                    var poc = 2 * (slice.frame_num_offset + slice.frame_num);

                    //B帧,两帧的fnm相等，非参考帧在前
                    if (slice.nalu.nal_reference_idc === 0) {
                        poc--;
                    }

                    field_poc[0] = poc;
                    field_poc[1] = poc;
                }
            }
            var max_poc = Math.max(field_poc[0], field_poc[1]);
            var pic_filed_poc_sum = field_poc[0] + field_poc[1];
            var pic_field_poc = [max_poc + 1, max_poc + 1];
            if (slice.encode_type !== SliceParser.EncodeTypes.BOTTOM_FIELD) pic_field_poc[0] = field_poc[0];
            if (slice.encode_type !== SliceParser.EncodeTypes.TOP_FIELD) pic_field_poc[1] = field_poc[1];
            slice.poc.sb = Math.min(pic_field_poc[0], pic_field_poc[1]);
            slice.poc.sb_other = pic_filed_poc_sum - slice.poc.sb;

            /* Set up the prev_ values for decoding POC of the next picture. */
            var got_reset = slice.got_reset;
            this._prev_frame_num = got_reset ? 0 : slice.frame_num;
            this._prev_frame_num_offset = got_reset ? 0 : slice.frame_num_offset;
            if (slice.nalu.nal_reference_idc !== 0) {
                if (!got_reset) {
                    this._prev_poc_msb = slice.poc.msb;
                    this._prev_poc_lsb = slice.poc.lsb;
                } else {
                    this._prev_poc_msb = 0;
                    this._prev_poc_lsb = slice.encode_type === SliceParser.EncodeTypes.BOTTOM_FIELD ? 0 : field_poc[0];
                }
            }
        }
    }]);

    return H264POC;
}();

exports = module.exports = H264POC;
//# sourceMappingURL=h264_poc.js.map