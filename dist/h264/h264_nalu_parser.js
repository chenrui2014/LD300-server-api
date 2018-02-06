'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Created by Luky on 2017/8/2.
 */

var NALU = function () {
    function NALU(data) {
        _classCallCheck(this, NALU);

        this.forbidden_bit = !!(data[0] & 0x80); //1bit
        this.nal_reference_idc = (data[0] & 0x60) >> 5; //2bit
        this.nal_unit_type = data[0] & 0x1f;
        this.key_frame = this.nal_unit_type === NALU.TYPES.IDR;
        this.nal_unit_type_string = NALU.getTypeString(this.nal_unit_type);
    }

    _createClass(NALU, [{
        key: 'type',
        get: function get() {
            return this.nal_unit_type;
        }
    }, {
        key: 'f',
        get: function get() {
            return this.forbidden_bit;
        }
    }, {
        key: 'nri',
        get: function get() {
            return this.nal_reference_idc;
        }
    }, {
        key: 'isKeyframe',
        get: function get() {
            return this.key_frame;
        }
    }], [{
        key: 'getTypeString',
        value: function getTypeString(ut) {
            switch (ut) {
                case 1:case 19:
                    return 'SLICE';
                case 2:case 3:case 4:
                    return 'DB_';
                case 5:
                    return 'IDR';
                case 6:
                    return 'SEI';
                case 7:
                    return 'SPS';
                case 8:
                    return 'PPS';
                case 9:
                    return 'AUD';
                default:
                    return 'Other';
            }
        }
    }, {
        key: 'TYPES',
        get: function get() {
            return {
                'SLICE': 1,
                'SLICE_NON_IDR': 1,
                'DPA': 2,
                'DPB': 3,
                'DPC': 4,
                'IDR': 5,
                'SEI': 6,
                'SPS': 7,
                'PPS': 8,
                'AUD': 9,
                'END_SEQUENCE': 10,
                'END_STREAM': 11,
                'FILLER_DATA': 12,
                'SPS_EXT': 13,
                'AUXILIARY_SLICE': 19
            };
        }
    }, {
        key: 'NRI',
        get: function get() {
            return {
                'DISPOS': 0,
                'LOW': 1,
                'HIGH': 2,
                'HIGHEST': 3
            };
        }
    }]);

    return NALU;
}();

exports = module.exports = NALU;
//# sourceMappingURL=h264_nalu_parser.js.map