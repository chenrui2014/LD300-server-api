'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Created by Luky on 2017/8/6.
 */

var Transform = require('stream').Transform;
var NALU = require('../../h264/h264_nalu_parser');
var SPSParser = require('../../h264/h264_sps_parser');
var PPSParser = require('../../h264/h264_pps_parser');
var SEIParser = require('../../h264/h264_sei_parser');
var SliceParser = require('../../h264/h264_slice_parser');
var POC = require('../../h264/h264_poc');
var config = global.server_config || require('../../config/config');
var FLV = require('../../flv/flv_encoder');
var _ = require('lodash');
var drop_span = 5;

var cacheType = {
    'IDR': 0,
    'Frame_time': 1,
    'Frame_count': 2
};

var H264Switch = function (_Transform) {
    _inherits(H264Switch, _Transform);

    function H264Switch() {
        var cacheType = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'IDR';
        var dropOption = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

        _classCallCheck(this, H264Switch);

        var _this = _possibleConstructorReturn(this, (H264Switch.__proto__ || Object.getPrototypeOf(H264Switch)).call(this));

        _this._out = 0;
        //this._h264=new H264Decoder();
        _this._amf2 = {
            duration: 0,
            width: 0,
            height: 0,
            videodatarate: 0,
            framerate: 100,
            videocodecid: FLV.VideoEncodings.AVC,
            title: 'lambda 0.1',
            encoder: 'lambda',
            filesize: 0
        };
        _this._cacheType = H264Switch.getCacheType(cacheType);
        _this._cache = [];
        if (_this._cacheType === cacheType.IDR) {
            _this._cacheOption = _.clamp(dropOption, 1, 3);
            _this._push = _this._pushTypeIDR;
            _this._transform = _this._transformIDR;
        } else {
            _this._transform = _this._transformOther;
            _this._size = 0;
            /*            this._head={_next:null};
                        this._head._pre=this._head;*/
            if (_this._cacheType === cacheType.Frame_time) {
                _this._push = _this._pushTypeFrameTime;
                _this._cacheOption = _.clamp(dropOption, 500, 3000);
                _this._htime = null;
            } else if (_this._cacheType === cacheType.Frame_count) {
                _this._push = _this._pushTypeFrameCount();
                _this._cacheOption = _.clamp(dropOption, 10, 75);
            }
        }

        _this._SPSTable = [];
        _this._SPSBuffers = [];
        _this._PPSTable = [];
        _this._PPSBuffers = [];
        _this._SEI = {};
        _this._SEIBuffer = null;
        _this._poc = new POC();
        return _this;
    }

    _createClass(H264Switch, [{
        key: 'open',
        value: function open() {
            this._out = 1;
        }
    }, {
        key: 'close',
        value: function close() {
            this._out = 0;
        }
    }, {
        key: '_isIDR',
        value: function _isIDR(slice) {
            return slice.nal_unit_type_string === 'IDR';
        }
    }, {
        key: '_pushTypeIDR',
        value: function _pushTypeIDR(slice, buf) {
            var p = {
                slice: slice,
                buf: buf,
                idr: this._isIDR(slice)
            };
            if (p.idr) {
                //按组存放
                this._cache.push([p]);
            } else {
                _.last(this._cache).push(p);
            }
            if (this._cache.length > this._cacheOption) {
                this._size -= this._cache[0].length;
                this._cache.splice(0, 1);
            }
        }
    }, {
        key: '_link',
        value: function _link(p) {
            if (p.idr) {
                //按组存放
                p.inorder = true;
                p.maxPOC = Math.min(p.cid, p.cid2);
                this._cache.push([p]);
            } else {
                var last = _.last(this._cache);
                last.push(p);
                if (Math.min(p.cid, p.cid2) < last[0].maxPOC) {
                    last[0].inorder = false;
                }
            }

            /*        p._pre=this._head._pre;
                    this._head._pre.next=p;
                    this._head._pre=p;*/
            this._size++;
        }
    }, {
        key: '_unlinkByTime',
        value: function _unlinkByTime() {
            var cur = config.runtimeLength();
            if (this._cacheOption - this._htime < 500) {
                return;
            }
            var del = cur - this._cacheOption;
            var i = 0,
                count = 0;
            while (_.last(this._cache[i]).time <= del) {
                count += this._cache[i].length;i++;
            }
            if (i > 0) {
                this._cache.splice(0, i);
                this._size -= count;
            }
        }
    }, {
        key: '_unlinkByCount',
        value: function _unlinkByCount() {
            if (this._size * 1.25 < this._cacheOption) {
                return;
            }
            var del = this._size - this._cacheOption;
            var i = 0,
                count = 0,
                countpre = 0;
            do {
                countpre = count;
                count += this._cache[i].length;
            } while (count <= del);
            if (del - countpre <= 3) {
                //如果剩下的只有一个I帧甚至3个帧一并删除
                this._cache.splice(0, i + 1);
                this._size -= count;
                del = 0;
            } else if (i > 0) {
                this._cache.splice(0, i);
                this._size -= countpre;
                del -= countpre;
            }
            if (!del) return;
            //............
        }
    }, {
        key: '_pushTypeFrameTime',
        value: function _pushTypeFrameTime(slice, buf) {
            this._htime = this._htime || config.runtimeLength();
            this._link({
                time: config.runtimeLength(),
                slice: slice,
                cid: slice.poc.sb,
                cid2: slice.poc.sb_other,
                sid: slice.poc.pic_num,
                buf: buf,
                idr: this._isIDR(slice),
                _next: null
            });
            this._unlinkByTime();
        }
    }, {
        key: '_pushTypeFrameCount',
        value: function _pushTypeFrameCount(slice, buf) {
            this._link({
                slice: slice,
                cid: slice.poc.sb,
                sid: slice.poc.pic_num,
                buf: buf,
                idr: this._isIDR(slice),
                _next: null
            });
            this._unlinkByCount();
        }
    }, {
        key: '_parseNALU',
        value: function _parseNALU(nalu) {
            var unit = new NALU(nalu);
            switch (unit.type) {
                case NALU.TYPES.SPS:
                    {
                        var ret = _.defaults(SPSParser.parseSPS(nalu), { nalu: unit });
                        if (this._amf2.width === 0) {
                            this._amf2.width = ret.present_size.width;
                            this._amf2.height = ret.present_size.height;
                        }
                        this._SPSTable[ret.sps_id] = ret;
                        this._SPSBuffers[ret.sps_id] = nalu;
                        return ret;
                    }
                case NALU.TYPES.PPS:
                    {
                        var _ret = _.defaults(PPSParser.parsePPS(nalu, this._SPSTable), { nalu: unit });
                        this._PPSTable[_ret.pps_id] = _ret;
                        this._PPSBuffers[_ret.pps_id] = nalu;
                        return _ret;
                    }
                case NALU.TYPES.SEI:
                    {
                        //一般不需要解析
                        this._SEIBuffer = nalu;
                        return this._SEI = _.defaults(SEIParser.parseSEI(nalu), { nalu: unit });
                    }
                case NALU.TYPES.IDR:
                case NALU.TYPES.SLICE:
                case NALU.TYPES.AUXILIARY_SLICE:
                    if (!this._isIDRType) {
                        var slice = _.defaults(SliceParser.parseSlice(nalu, this._SPSTable, this._PPSTable, this._SEI || {}), { nalu: unit });
                        this._poc.initPOC(slice, this._SPSTable[slice.sps_id]);
                        SEIParser.resetSEI(this._SEI);
                        return slice;
                    }
            }
            return { nalu: unit };
        }
    }, {
        key: '_transformOther',
        value: function _transformOther(nal, enc, next) {}
    }, {
        key: '_transformIDR',
        value: function _transformIDR(nalu, enc, next) {
            var info = this._parseNALU(nalu);

            switch (this._out) {
                case 0:
                    if (info.nalu.nal_unit_type_string === 'SLICE' || info.nalu.nal_unit_type_string === 'IDR') {
                        this._push(info, nalu);
                    }
                    return next();
                case 1:
                    this.push(FLV.headBytes());
                    this.push(FLV.scriptTag(this._amf2));
                    if (this._cache.length) {
                        this._pushSequenceHander();
                        for (var i = 0; i < this._cache.length; i++) {
                            var slices = this._cache[i];
                            for (var j = 0; j < slices.length; j++) {
                                this.push(FLV.VedioTagAVCPackageNALU(0, 0, slices[j].buf, slices.idr ? FLV.FrameTypes.KeyFrame : FLV.FrameTypes.InterFrame));
                            }
                        }
                        this._cache = [];
                    }
                    this._out = 2;
                    return next();
                case 2:
                    if (info.nalu.nal_unit_type_string === 'IDR') {
                        this._pushSequenceHander();
                        this.push(FLV.VedioTagAVCPackageNALU(0, 0, nalu, FLV.FrameTypes.KeyFrame));
                    } else if (info.nalu.nal_unit_type_string === 'SLICE') {
                        this.push(FLV.VedioTagAVCPackageNALU(0, 0, nalu, FLV.FrameTypes.InterFrame));
                    }

                    return next();
            }
            next();
        }
    }, {
        key: '_isEmpty',
        get: function get() {
            return this._head._next = null;
        }
    }], [{
        key: 'getCacheType',
        value: function getCacheType(c) {
            switch (c.toUpperCase()) {
                case 'IDR':
                    return 0;
                case 'Frame-time':
                    return 1;
                case 'Frame-count':
                    return 2;
            }
            return 0;
        }
    }, {
        key: 'CacheType',
        get: function get() {
            return cacheType;
        }
    }]);

    return H264Switch;
}(Transform);

exports = module.exports = H264Switch;
//# sourceMappingURL=_h264_2flv.js.map