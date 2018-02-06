'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Created by Luky on 2017/8/6.
 */
var _ = require('lodash');
var amf = require('amf');
if (!('write' in amf)) {
    amf = require('../../_3part/amf');
}
var SPSParser = require('../h264/h264_sps_parser');
var ADTS = require('../acc/acc_adts_parser');
var EventEmitter = require('events').EventEmitter;
var h264Prefix = Buffer.from([0, 0, 1]);

var frameType = {
    'KeyFrame': 1,
    'InterFrame': 2,
    'DisposableInter': 3,
    'GeneratedKeyFrame': 4,
    'VedioInfo': 5
};

var audioCoding = {
    'ADPCM': 1,
    'AAC': 10,
    'MP3': 2,
    'MP3_8HZ': 14
};

var AVCPackageType = {
    'SequenceHeader': 0,
    'NALU': 1,
    'EndOfSequence': 2
};

var videoConding = {
    'JEPG': 1,
    'SorensonH263': 2,
    'ScreenVideo': 3,
    'On2VP6': 4,
    'On2VPWithAlpha': 5,
    'ScreenVideoV2': 6,
    'AVC': 7
};

var FLVEncoder = function (_EventEmitter) {
    _inherits(FLVEncoder, _EventEmitter);

    function FLVEncoder() {
        var video = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
        var audio = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

        _classCallCheck(this, FLVEncoder);

        var _this = _possibleConstructorReturn(this, (FLVEncoder.__proto__ || Object.getPrototypeOf(FLVEncoder)).call(this));

        _this._hasVideo = video;
        _this._hasAudio = audio;
        _this._headTags = null;
        _this._slices = [];
        _this._adst = null;
        _this._sps = null;
        _this._ready = video - 0 + (audio - 0);
        _this._videoDuration = 0;
        _this._audioDuration = 0;
        _this._metadata = {
            //文件部分
            duration: 0, filesize: 0,
            //扩展部分flv.js
            hasVideo: _this._hasVideo,
            hasAudio: _this._hasAudio,
            //其他
            title: 'lambda 0.1', encoder: 'lambda'
        };
        _this.clients = [];
        _this.on('newListener', _this._newListener.bind(_this));
        _this.on('removeListener', _this._removeListener.bind(_this));
        return _this;
    }

    _createClass(FLVEncoder, [{
        key: 'emitHeadTag',
        value: function emitHeadTag() {
            if (!this.ready) return false;
            this._headTags = true;
            this.emit('data', FLVEncoder.headBytes(this._hasVideo, this._hasAudio));
            this.emit('data', FLVEncoder.scriptTag(this._metadata));
            if (this._hasVideo) this.emit('data', FLVEncoder.VedioTagAVCPacket_DecorderConfigurationRecord(this._sps, this._pps, this._profile, this._profile_compatibility, this._level));
            if (this._hasAudio) this.emit('data', FLVEncoder.audioTagAVCPackage_AACSpecificConfig_ADST(this._adst));
            return true;
        }
    }, {
        key: '_setVedioMetaData',
        value: function _setVedioMetaData(codeid, width, height) {
            var fps = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
            var datarate = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 0;

            this._metadata.videocodecid = codeid;
            this._metadata.width = width;
            this._metadata.height = height;
            this._metadata.videodatarate = datarate;
            this._metadata.framerate = fps || 25;
            /*//视频部分
            videocodecid: videoConding.AVC,//视频编码方式
            framerate: 25,//视频帧率
            width:0,//视频宽度
            height:0,//视频高度
            videodatarate: 0,//视频码率*/
        }
    }, {
        key: '_getVedioTimeTamp',
        value: function _getVedioTimeTamp() {
            var inc = 1000 / this._metadata.framerate;
            var ret = this._videoDuration;
            this._videoDuration += inc;
            return ret;
        }
    }, {
        key: 'VedioTagAVCPacket_DecorderConfigurationRecord',
        value: function VedioTagAVCPacket_DecorderConfigurationRecord(sps, pps, fps) {
            if (sps.length === 0 || pps.length === 0) {
                throw new RangeError('sps needed,pps needed');
            }
            this._sps = sps;
            this._pps = pps;
            this._setVedioMetaData(videoConding.AVC, sps.present_size.width, sps.present_size.height, fps);
            var spsObj = SPSParser.parseSPS(sps[0]);
            this._profile = spsObj.profile_idc;
            this._profile_compatibility = spsObj.profile_compatibility;
            this._level = spsObj.level_idc;
            this._ready--;
        }
    }, {
        key: 'emitData',
        value: function emitData(buf, timestamp) {
            if (!this._headTags && !this.emitHeadTag()) {
                return;
            }
            //先简单实现
            this.emit('data', buf);
            //this._slices.push(buf);
        }
    }, {
        key: 'VedioTagAVCPackageNALU',
        value: function VedioTagAVCPackageNALU(nalu) {
            var _frameType = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : -1;

            var timestamp = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : -1;

            if (_frameType === -1) {
                var index = nalu.indexOf(h264Prefix);
                nalu = nalu.slice(index + 3);
                var unit = new NALU(nalu);
                _frameType = unit.key_frame ? frameType.KeyFrame : frameType.InterFrame;
            }
            if (timestamp === -1) timestamp = this._getVedioTimeTamp();
            var ret = FLVEncoder.VedioTagAVCPackageNALU(nalu, _frameType, timestamp);
            this.emitData(ret, timestamp);
            return ret;
        }
    }, {
        key: '_getAudioTimeStamp',
        value: function _getAudioTimeStamp() {
            var ESSize = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;

            var inc = ESSize * this._metadata._frame_size * 1000 / this._metadata.audiosamplerate;
            var ret = this._audioDuration;
            this._audioDuration += inc;
            return ret;
        }
    }, {
        key: '_setAudioMetaData',
        value: function _setAudioMetaData(codeid, samplerate, bit, stero) {
            var datarate = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 0;

            //音频部分
            this._metadata.audiocodecid = codeid;
            this._metadata.audiodatarate = datarate;
            this._metadata.audiosamplerate = samplerate;
            this._metadata.stereo = !!stero;
            this._metadata.audiosamplesize = bit;
            this._frame_size = 1024;
            this._audioInc = 0;
        }
    }, {
        key: 'audioTagAVCPackage_AACSpecificConfig_ADST',
        value: function audioTagAVCPackage_AACSpecificConfig_ADST(data) {
            if (null !== this._adst) return;
            this._adst = data.slice(0, 9);
            var adst = ADTS.ParseADTSHeader(data);
            this._setAudioMetaData(audioCoding.AAC, adst.freq, 16, adst.channel > 1);
            this._adstHeadSize = adst.acc_raw_data_index;
            this._ready--;
        }
    }, {
        key: 'audioTagAVCPackage_AACRowdata_ADST',
        value: function audioTagAVCPackage_AACRowdata_ADST(data) {
            var _timestamp = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : -1;

            var adts = ADTS.ParseADTSHeader(data);
            if (_timestamp === -1) _timestamp = this._getAudioTimeStamp(adts.blocks);
            return this.audioTagAVCPackage_AACRowdata_ES(data.slice(adts.acc_raw_data_index, adts.acc_raw_data_length), _timestamp);
        }
    }, {
        key: 'audioTagAVCPackage_AACRowdata_ES',
        value: function audioTagAVCPackage_AACRowdata_ES(data) {
            var _timestamp = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : -1;

            if (_timestamp === -1) _timestamp = this._getAudioTimeStamp();
            var ret = FLVEncoder.audioTagAVCPackage_AACRowdata_ES(data, _timestamp);
            this.emitData(ret, _timestamp);
            return ret;
        }
    }, {
        key: 'ready',
        get: function get() {
            return this._ready <= 0;
        }
    }], [{
        key: 'headBytes',
        value: function headBytes() {
            var video = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
            var audio = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

            var type = 0;
            if (video) {
                type |= 0x01;
            }
            if (audio) {
                type |= 0x04;
            }
            var head = [0x46, 0x4c, 0x56, 0x01, type, 0x00, 0x00, 0x00, 0x09, 0x00, 0x00, 0x00, 0x00];
            return Buffer.from(head);
        }
    }, {
        key: 'scriptTag',
        value: function scriptTag(obj) {
            var arr = [];
            _.defaults(arr, obj);
            arr.length = _.keys(obj).length;
            var amf1 = Buffer.from([0x02, 0x00, 0x0a, 0x6f, 0x6e, 0x4d, 0x65, 0x74, 0x61, 0x44, 0x61, 0x74, 0x61]);
            var amf2Buf = Buffer.allocUnsafe(400);
            var info = {};
            amf.write(amf2Buf, arr, info);
            var len = amf1.length + info.byteLength;
            var head = FLVEncoder._tagHead(0x12, len, 0);
            var tail = FLVEncoder._tagTail(len);
            var buf = Buffer.allocUnsafe(head.length + tail.length + len);
            head.copy(buf);
            var offset = head.length;
            amf1.copy(buf, offset);offset += amf1.length;
            amf2Buf.copy(buf, offset, 0, info.byteLength);offset += info.byteLength;
            tail.copy(buf, offset);
            return buf;
        }
    }, {
        key: '_calcTimestamp',
        value: function _calcTimestamp(timestamp) {
            return ((timestamp & 0xffffff) << 8) + ((timestamp & 0xff000000) >> 24);
        }
    }, {
        key: 'setTimestamp',
        value: function setTimestamp(slice, timestamp) {
            timestamp = FLVEncoder._calcTimestamp(timestamp);
            slice.writeUInt32BE(timestamp, 4);
            return slice;
        }
    }, {
        key: '_tagHead',
        value: function _tagHead(type, dataSize, timestamp) {
            timestamp = FLVEncoder._calcTimestamp(timestamp);
            var head = Buffer.from([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
            head.writeUInt32BE(dataSize, 0);
            head[0] = type;
            head.writeUInt32BE(timestamp, 4);
            return head;
        }
    }, {
        key: '_tagTail',
        value: function _tagTail(datasize) {
            var lenBuffer = Buffer.allocUnsafe(4);
            lenBuffer.writeUInt32BE(datasize + 11, 0);
            return lenBuffer;
        }
    }, {
        key: 'VedioTagAVCPackage_EndOfSequence',
        value: function VedioTagAVCPackage_EndOfSequence() {
            //0900000400000000000000020000000000000f
            return Buffer.from([0x09, 0x00, 0x00, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x0f]);
            /*        let data=Buffer.from([AVCPackageType.EndOfSequence,0x00,0x00,0x00]);
                    let head=FLVEncoder._tagHead(0x09,0,0,data.length);
                    let tail=FLVEncoder._tagTail(data.length);
                    let buf=Buffer.allocUnsafe(head.length+data.length+tail.length);
                    head.copy(buf,0);
                    data.copy(buf,head.length);
                    tail.copy(buf,head.length+data.length);
                    return buf;*/
        }
    }, {
        key: 'VedioTagAVCPacket_DecorderConfigurationRecord',
        value: function VedioTagAVCPacket_DecorderConfigurationRecord(sps, pps, profile, profile_compatibility, level) {
            /*console.log(profile);
            console.log(profile_compatibility);
            console.log(level);*/
            if (sps.length === 0 || pps.length === 0) {
                throw new RangeError('sps needed,pps needed');
            }
            if (profile == null) {
                var spsObj = SPSParser.parseSPS(sps[0]);
                profile = spsObj.profile_idc;
                profile_compatibility = spsObj.profile_compatibility;
                level = spsObj.level_idc;
            }
            var size = 1 + 4 + 7 + 2 * sps.length + 2 * pps.length;
            for (var i = 0; i < sps.length; i++) {
                size += sps[i].length;
            }
            for (var _i = 0; _i < pps.length; _i++) {
                size += pps[_i].length;
            }
            var head = FLVEncoder._tagHead(0x09, size, 0);
            var tail = FLVEncoder._tagTail(size);
            var buf = Buffer.allocUnsafe(head.length + size + tail.length);
            head.copy(buf, 0);
            var offset = head.length;
            //经测试，帧类型为frameType.KeyFrame
            //buf.writeUInt8((frameType.VedioInfo<<4)+videoConding.AVC,offset++);
            buf.writeUInt8((frameType.KeyFrame << 4) + videoConding.AVC, offset++);
            buf.writeUInt32BE( /*AVCPackageType.SequenceHeader<<24*/0, offset);offset += 4;
            buf.writeUInt8(1, offset++);
            buf.writeUInt8(profile, offset++);
            buf.writeUInt8(profile_compatibility, offset++);
            buf.writeUInt8(level, offset++);
            buf.writeUInt8(0xff, offset++);
            buf.writeUInt8(0xe0 | sps.length, offset++);
            for (var _i2 = 0; _i2 < sps.length; _i2++) {
                var spsi = sps[_i2];
                buf.writeUInt16BE(spsi.length, offset);offset += 2;
                spsi.copy(buf, offset);offset += spsi.length;
            }
            buf.writeUInt8(pps.length, offset++);
            for (var _i3 = 0; _i3 < pps.length; _i3++) {
                var ppsi = pps[_i3];
                buf.writeUInt16BE(ppsi.length, offset);offset += 2;
                ppsi.copy(buf, offset);offset += ppsi.length;
            }
            tail.copy(buf, offset);
            //console.log(buf.toString('hex'));
            return buf;
        }
    }, {
        key: 'VedioTagAVCPackageNALU',
        value: function VedioTagAVCPackageNALU(data, frameType, timestamp) {
            var datasize = data.length + 5 + 4;
            var head = FLVEncoder._tagHead(0x09, datasize, timestamp);
            var tail = FLVEncoder._tagTail(datasize);
            var buf = Buffer.allocUnsafe(datasize + head.length + tail.length);
            head.copy(buf);
            var offset = head.length;
            buf.writeUInt8((frameType << 4) + videoConding.AVC, offset++);
            buf.writeUInt32BE(0, offset); //AVCPacketType+CompostionTime
            buf.writeUInt8(AVCPackageType.NALU, offset);offset += 4;
            buf.writeUInt32BE(data.length, offset);offset += 4;
            data.copy(buf, offset);offset += data.length;
            tail.copy(buf, offset);
            return buf;
        }

        /**
         * If the SoundFormat indicates AAC, the SoundType should be 1 (stereo) and the SoundRate should be 3 (44 kHz).
         However, this does not mean that AAC audio in FLV is always stereo, 44 kHz data. Instead, the Flash Player ignores
         these values and extracts the channel and sample rate data is encoded in the AAC bit stream.
         */

    }, {
        key: 'audioTagAVCPackage_AACRowdata_ADST',
        value: function audioTagAVCPackage_AACRowdata_ADST(data, _timestamp) {
            var adts = ADTS.ParseADTSHeader(data);
            return FLVEncoder.audioTagAVCPackage_AACRowdata_ES(data.slice(adts.acc_raw_data_index), _timestamp);
        }
    }, {
        key: 'audioTagAVCPackage_AACRowdata_ES',
        value: function audioTagAVCPackage_AACRowdata_ES(data, _timestamp) {
            var datasize = 2 + data.length;
            var head = FLVEncoder._tagHead(0x08, datasize, _timestamp);
            var tail = FLVEncoder._tagTail(datasize);
            var buf = Buffer.allocUnsafe(datasize + head.length + tail.length);
            head.copy(buf);
            var offset = head.length;
            //10101111
            buf.writeUInt8(0xaf, offset++); //AAC 44hz 16bit sndstereo
            buf.writeUInt8(0x01, offset++); //acc raw
            data.copy(buf, offset);offset += data.length;
            tail.copy(buf, offset);
            return buf;
        }
    }, {
        key: 'audioTagAVCPackage_AACSpecificConfig_ADST',
        value: function audioTagAVCPackage_AACSpecificConfig_ADST(data) {
            var adts = ADTS.ParseADTSHeader(data);
            var b1 = adts.profile + 1 << 3 | (adts.freqIndex & 0xe) >> 1;
            var b2 = (adts.freqIndex & 0x1) << 7 | adts.channel << 3;
            var datasize = 4 /*+3*/;
            var head = FLVEncoder._tagHead(0x08, datasize, 0);
            var tail = FLVEncoder._tagTail(datasize);
            var buf = Buffer.allocUnsafe(datasize + head.length + tail.length);
            head.copy(buf);
            var offset = head.length;
            buf.writeUInt8(0xaf, offset++); //AAC 44hz 16bit sndstereo
            buf.writeUInt8(0x00, offset++); //acc sequence header
            buf.writeUInt8(b1, offset++);
            buf.writeUInt8(b2, offset++);
            /*        buf.writeUInt8(0x56,offset++);
                    buf.writeUInt8(0xE5,offset++);
                    buf.writeUInt8(0x00,offset++);*/
            //0x56 0xE5 0x00 SBR
            tail.copy(buf, offset);
            return buf;
        }
    }, {
        key: 'FrameTypes',
        get: function get() {
            return frameType;
        }
    }, {
        key: 'AudioEncodings',
        get: function get() {
            return audioCoding;
        }
    }, {
        key: 'VideoEncodings',
        get: function get() {
            return videoConding;
        }
    }]);

    return FLVEncoder;
}(EventEmitter);

exports = module.exports = FLVEncoder;
//# sourceMappingURL=flv_encoder.js.map