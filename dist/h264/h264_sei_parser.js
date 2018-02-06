'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Created by Luky on 2017/8/7.
 */

var Util = require('./h264_util');
var ExpGolomb = require('./golomb');

var SEI_type = {
    BUFFERING_PERIOD: 0, ///< buffering period (H.264, D.1.1)
    PIC_TIMING: 1, ///< picture timing
    USER_DATA_REGISTERED: 4, ///< registered user data as specified by Rec. ITU-T T.35
    USER_DATA_UNREGISTERED: 5, ///< unregistered user data
    RECOVERY_POINT: 6, ///< recovery point (frame # to decoder sync)
    FRAME_PACKING: 45, ///< frame packing arrangement
    DISPLAY_ORIENTATION: 47, ///< display orientation
    GREEN_METADATA: 56 ///< GreenMPEG information
};

var SEIParser = function () {
    function SEIParser() {
        _classCallCheck(this, SEIParser);
    }

    _createClass(SEIParser, null, [{
        key: 'parseSEI',
        value: function parseSEI(nalu) {
            var rbsp = Util.ebsp2rbsp(nalu); //不对所有内容解码
            var gb = new ExpGolomb(rbsp);
            gb.skipByte();
            var ret = {};
            while (gb.bitsAvailable > 16 && gb.readUN(16, false) > 0) {
                var type = 0;
                var size = 0;
                var next = 0;

                do {
                    if (gb.bitsAvailable < 8) return ret;
                    type += gb.readUN(8, false);
                } while (gb.readUByte() === 0xff);

                do {
                    if (gb.bitsAvailable < 8) return ret;
                    size += gb.readUN(8, false);
                } while (gb.readUByte() === 0xff);

                if (size > gb.bitsAvailable / 8) {
                    console.error('SEI type ' + type + ' size ' + 8 * size + ' truncated at ' + gb.bitsAvailable);
                    return ret;
                }
                next = gb.index + 8 * size;

                if (type === SEI_type.RECOVERY_POINT) {
                    SEIParser._decodeRecoveryPoint(ret, gb);
                    gb.skipBits(next - gb.index);
                } else {
                    gb.skipBits(8 * size);
                }
                // FIXME check bits here
                gb.alignToByte();
            }

            return ret;
        }
    }, {
        key: '_decodeRecoveryPoint',
        value: function _decodeRecoveryPoint(ssi, gb) {
            ssi.recovery_point = { recovery_frame_cnt: gb.readUEG() };
            gb.skipBits(4);
            return val;
        }
    }, {
        key: 'resetSEI',
        value: function resetSEI(sei) {
            sei.recovery_point = { recovery_frame_cnt: 1 };
        }
    }, {
        key: 'TYTES',
        get: function get() {
            return SEI_type;
        }
    }]);

    return SEIParser;
}();

exports = module.exports = SEIParser;
//# sourceMappingURL=h264_sei_parser.js.map