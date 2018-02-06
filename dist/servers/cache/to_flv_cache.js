'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Created by Luky on 2017/8/11.
 */

//const Transform=require('stream').Transform;
var Writable = require('stream').Writable;
var NALU = require('../../h264/h264_nalu_parser');
var SPSParser = require('../../h264/h264_sps_parser');
/*const PPSParser=require('../../h264/h264_pps_parser');
const SEIParser=require('../../h264/h264_sei_parser');
const SliceParser=require('../../h264/h264_slice_parser');
const POC=require('../../h264/h264_poc');*/
var config = global.server_config || require('../../config/config');
var FLV = require('../../flv/flv_encoder');
var _ = require('lodash');
var assert = require('assert');
var ADTS = require('../../acc/acc_adts_parser');
var h264Prefix = Buffer.from([0, 0, 1]);

var _require = require('../../log/log'),
    Parser = _require.Parser;
/*let fs=require('fs');
let file=fs.createWriteStream('d:/audio_flv.test.aac',{
    flags: 'w',
    encoding: null,
    fd: null,
    mode: 0o666,
    autoClose: true
});*/

var H264AndAACCache = function (_Writable) {
    _inherits(H264AndAACCache, _Writable);

    function H264AndAACCache() {
        var video = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
        var audio = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

        _classCallCheck(this, H264AndAACCache);

        var _this = _possibleConstructorReturn(this, (H264AndAACCache.__proto__ || Object.getPrototypeOf(H264AndAACCache)).call(this, { objectMode: true }));

        _this._hasVideo = video;
        _this._hasAudio = audio;
        _this._size_video_totle = 0;
        _this._size_audio_totle = 0;
        _this._size_video = 0;
        _this._size_audio = 0;
        _this.clear();
        Parser(_this, 'to_flv_cache.js');
        return _this;
    }

    _createClass(H264AndAACCache, [{
        key: 'clear',
        value: function clear() {
            this._sps = null;
            this._pps = null;
            this._adts = null;
            //this._sei=null;
            //sei先不管
            this._slices = [];
            this._ready = false;
            this._clients = [];
            var metadata = {
                //文件部分
                duration: 0, filesize: 0,
                //扩展部分flv.js
                hasVideo: this._hasVideo,
                hasAudio: this._hasAudio,
                //其他
                title: 'lambda 0.1', encoder: 'lambda'
            };
            if (this._hasVideo) {
                metadata.videocodecid = FLV.VideoEncodings.AVC; //视频编码方式
                metadata.framerate = 100; //看看100是否能加快直播速度25;//视频帧率
                metadata.width = 0; //视频宽度
                metadata.height = 0; //视频高度
                metadata.videodatarate = 0; //视频码率
            }
            if (this._hasAudio) {
                metadata.audiocodecid = FLV.AudioEncodings.AAC; //音频编码方式
                metadata.audiodatarate = 0; //音频采样率,
                metadata.audiosamplerate = 0; //音频采样率,
                metadata.audiosamplesize = 16; //音频采样位数，采样长度，采样深度
                metadata.stereo = false; //立体声,
            }
            this.metadata = metadata;
            this._size_video_totle = 0;
            this._size_audio_totle = 0;
            this._size_video = 0;
            this._size_audio = 0;
        }
    }, {
        key: 'removeClient',
        value: function removeClient(client) {
            _.remove(this._clients, function (c) {
                return c === client;
            });
            this.log('客户退出', { length: this._clients.length });
        }
    }, {
        key: 'addClient',
        value: function addClient(client) {
            client.time0 = 0;
            this._clients.push(client);
            this.log('新连入客户', { length: this._clients.length });
            if (this._ready) {
                this._sendHead([client]);
            }
        }
    }, {
        key: '_sendAudio',
        value: function _sendAudio(slice, clients) {
            var _this2 = this;

            //if(this._clients.length>0)file.write(slice.data);
            _.each(clients || this._clients, function (cb) {
                var timestamp = 0;
                if (slice.dataType === 'data') {
                    var adts = slice.adts;
                    timestamp = adts.blocks * 1024 * 1000 / adts.freq;
                    cb.audioDuration = cb.audioDuration || 0;
                    _this2._audioDuration += timestamp;
                }
                cb(FLV.audioTagAVCPackage_AACRowdata_ADST(slice.data, timestamp), slice);
            });
        }
    }, {
        key: '_sendVideo',
        value: function _sendVideo(slice, clients) {
            _.each(clients || this._clients, function (cb) {
                cb(H264AndAACCache._toVedioTagAVCPackageNALU(slice.data, slice.key, H264AndAACCache._getTimestamp(cb, slice)), slice);
            });
        }
    }, {
        key: '_sendHead',
        value: function _sendHead(cbs) {
            var _this3 = this;

            _.each(cbs, function (cb) {
                cb(FLV.headBytes(_this3._hasVideo, _this3._hasAudio), { type: 'header' });
                cb(FLV.scriptTag(_this3.metadata), { type: 'tag', tagType: 'script' });
                if (null !== _this3._sps && null !== _this3._pps) cb(FLV.VedioTagAVCPacket_DecorderConfigurationRecord([_this3._sps], [_this3._pps], _this3._avc.profile, _this3._avc.profile_compatibility, _this3._avc.level), { type: 'tag', tagType: 'video', dataType: 'head' });
                if (null !== _this3._adts) {
                    cb(FLV.audioTagAVCPackage_AACSpecificConfig_ADST(_this3._adts), { type: 'tag', tagType: 'audio', dataType: 'head' });
                }
            });
            for (var j = 0; j < this._slices.length; j++) {
                var slicei = this._slices[j];
                if (slicei.tagType === 'video') {
                    this._sendVideo(slicei);
                } else {
                    this._sendAudio(slicei);
                }
            }
        }

        /*_toSequenceHander() {
            if(this._sei){
                this.push(FLV.VedioTagAVCPackageNALU(0,0,this._SEIBuffer,FLV.FrameTypes.InterFrame));
            }
        }*/

    }, {
        key: '_pushAudioADTS',
        value: function _pushAudioADTS(data) {
            var adts = ADTS.ParseADTSHeader(data);
            this._adts = data;
            this.metadata.audiosamplerate = adts.freq;
            this.metadata.stereo = adts.channel > 1;
            var slice = { type: 'tag', tagType: 'audio', dataType: 'data', codec: 'acc', adts: adts, data: data, time: config.runtimeLength() };
            if (!this._hasVideo && this._slices.length > 50) {
                this._slices = this._slices.slice(25);
            }
            this._slices.push(slice);
            if (!this._ready && this._VedioReady) {
                this._ready = true;
                this._sendHead(this._clients);
                return;
            }
            if (this._ready) this._sendAudio(slice);
        }
    }, {
        key: '_pushVedioH264',
        value: function _pushVedioH264(nalu) {
            var unit = new NALU(nalu);
            if (unit.type === NALU.TYPES.SPS) {
                if (null !== this._sps) return;
                var sps = SPSParser.parseSPS(nalu);
                this.metadata.width = sps.present_size.width;
                this.metadata.height = sps.present_size.height;
                this._avc = {
                    profile: sps.profile_idc,
                    profile_compatibility: sps.profile_compatibility,
                    level: sps.level_idc
                };
                this._sps = nalu;
                return;
            }
            if (unit.type === NALU.TYPES.PPS) {
                this._pps = nalu;
                return;
            }
            if (unit.type === NALU.TYPES.SEI) {
                return;
            }
            var isIDR = unit.key_frame;
            var slice = { type: 'tag', tagType: 'video', dataType: 'data', codec: 'h264', data: nalu, key: isIDR, time: config.runtimeLength() };
            if (isIDR) {
                this._slices = [slice];
                if (!this._ready && this._AudioReady) {
                    this._ready = true;
                    this._sendHead(this._clients);
                    return;
                }
            } else {
                this._slices.push(slice);
            }
            if (this._ready) this._sendVideo(slice);
        }
    }, {
        key: '_write',
        value: function _write(data_temp, enc, cb) {
            //不知道为什么数据会被篡改，所以复制一份
            var data = Buffer.from(data_temp);

            if (this._hasVideo) {
                var index = void 0;
                if ((index = data.slice(0, 4).indexOf(h264Prefix)) !== -1) {
                    this._pushVedioH264(data.slice(index + 3));
                    this._size_video += data.length;
                    if (this._size_video > 1024 * 1024 * 5) {
                        //5MB
                        this._size_video_totle += this._size_video;
                        this._size_video = 0;
                        this.log('接受视频数据增量记录', { totle: this._size_video_totle });
                    }
                }
            }
            if (this._hasAudio) {
                if (data[0] === 0xff && (data[1] & 0xf0) === 0xf0) {
                    this._pushAudioADTS(data);
                    this._size_audio += data.length;
                    if (this._size_audio > 1024 * 1024) {
                        //1MB
                        this._size_audio_totle += this._size_audio;
                        this._size_audio = 0;
                        this.log('接受音频数据增量记录', { totle: this._size_audio_totle });
                    }
                }
            }
            cb();
        }
    }, {
        key: '_AudioReady',
        get: function get() {
            return !this._hasAudio || this._adts !== null;
        }
    }, {
        key: '_VedioReady',
        get: function get() {
            return !this._hasVideo || this._sps !== null && this._pps !== null;
        }
    }], [{
        key: '_getTimestamp',
        value: function _getTimestamp(client, slice) {
            //if(!client.time0)console.log(`开始时间${slice.time}`);
            client.time0 = client.time0 || slice.time;
            //返回0，可以即时播放，这里需要通过时间戳加快播放速度
            return (/*slice.time-client.time0*/0
            );
        }
    }, {
        key: '_toVedioTagAVCPackageNALU',
        value: function _toVedioTagAVCPackageNALU(slice, iFrame, timestamp) {
            return FLV.VedioTagAVCPackageNALU(slice, iFrame ? FLV.FrameTypes.KeyFrame : FLV.FrameTypes.InterFrame, timestamp);
        }
    }]);

    return H264AndAACCache;
}(Writable);

exports = module.exports = H264AndAACCache;
//# sourceMappingURL=to_flv_cache.js.map