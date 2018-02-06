'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Created by Luky on 2017/8/30.
 */

var AdtsDecoder = require('./acc_adts_decoder');
var FLVEncoder = require('../flv/flv_encoder');
var Readable = require('stream').Readable;

var Adts2Flv = function (_Readable) {
    _inherits(Adts2Flv, _Readable);

    function Adts2Flv(stream) {
        _classCallCheck(this, Adts2Flv);

        var _this = _possibleConstructorReturn(this, (Adts2Flv.__proto__ || Object.getPrototypeOf(Adts2Flv)).call(this));

        _this._adtsDecoder = new AdtsDecoder();
        _this._adtsDecoder.on('adts', function (data) {
            _this._flvEncoder.audioTagAVCPackage_AACSpecificConfig_ADST(data);
        });
        _this._adtsDecoder.on('data', function (data) {
            _this._flvEncoder.audioTagAVCPackage_AACRowdata_ES(data);
        });
        _this._in = stream;
        _this._flvEncoder = new FLVEncoder(false, true);
        _this._flvEncoder.on('data', function (data) {
            _this.push(data);
        });
        _this._in.pipe(_this._adtsDecoder);
        return _this;
    }

    _createClass(Adts2Flv, [{
        key: '_read',
        value: function _read() {}
    }]);

    return Adts2Flv;
}(Readable);

exports = module.exports = Adts2Flv;
//# sourceMappingURL=adts2flv.js.map