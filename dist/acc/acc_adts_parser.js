'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Created by Luky on 2017/8/15.
 */

var ExpGolomb = require('../h264/golomb');

var freqs = [96000, 88200, 64000, 48000, 44100, 32000, 24000, 22050, 16000, 12000, 11025, 8000, 7350, 0, 0, 0];

var ADTSHeaderParser = function () {
    function ADTSHeaderParser() {
        _classCallCheck(this, ADTSHeaderParser);
    }

    _createClass(ADTSHeaderParser, null, [{
        key: 'ParseADTSHeader',
        value: function ParseADTSHeader(buf) {
            var gb = new ExpGolomb(buf);
            if (buf.length < 7) return {};
            if (gb.readUN(12) !== 0xFFF) return {};
            var ret = {};
            ret.ID = gb.readUN(1);
            gb.skipBits(2); //level
            ret.protection_absent = gb.readBoolean();
            ret.profile = gb.readUN(2);
            ret.freqIndex = gb.readUN(4);
            ret.freq = freqs[ret.freqIndex];
            gb.skipBits(1); //private_bit
            ret.channel = gb.readUN(3);
            gb.skipBits(4); //original_copy,home,copyright_1,copyright_2
            ret.acc_frame_length = gb.readUN(13);
            ret.acc_raw_data_length = ret.acc_frame_length - (ret.protection_absent ? 7 : 9);
            ret.acc_raw_data_index = ret.protection_absent ? 7 : 9;
            ret.fixedRate = gb.readUN(11) === 0x7ff;
            ret.blocks = gb.readUN(2) + 1;
            return ret;
        }
    }]);

    return ADTSHeaderParser;
}();

exports = module.exports = ADTSHeaderParser;
//# sourceMappingURL=acc_adts_parser.js.map