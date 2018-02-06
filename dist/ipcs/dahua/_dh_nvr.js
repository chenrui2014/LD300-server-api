'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Created by Luky on 2017/7/1.
 */
var PTZ = require('../base/ptz');
var DHIPC = require('./dh_ipc');
var _ = require('lodash');
var dhok = require('./dh_init');
var dhlib = require('./dhnetsdk');
var ref = require('ref');

//CLIENT_SearchDevices
//CLIENT_SearchDevicesByIPs
//查询局域网设备

var DHNVR = function (_DHIPC) {
    _inherits(DHNVR, _DHIPC);

    function DHNVR(options) {
        _classCallCheck(this, DHNVR);

        var _this = _possibleConstructorReturn(this, (DHNVR.__proto__ || Object.getPrototypeOf(DHNVR)).call(this, options));

        _this.brand = '';
        _this.video_protocol = 'onvif';
        _this.ptz_protocol = "config";
        _this.audio_protocol = "dahua";
        _this._channel = _this.nvr_channel;
        return _this;
    }

    _createClass(DHNVR, [{
        key: '_PTZ',
        value: function _PTZ(callback, cmd, p1) {
            var _this2 = this;

            if (!this._loginID) {
                if (callback) process.nextTick(function () {
                    callback('connect first');
                });
                return;
            }
            callback = callback || function () {};
            process.nextTick(function () {
                if (dhlib.functions.CLIENT_PTZControl(_this2._loginID, _this2.nvr_channel, cmd, p1, 0)) {
                    _this2.__lastCmd = _.bind(dhlib.functions.CLIENT_PTZControl, null, _this2._loginID, _this2.nvr_channel, cmd, p1, 1);
                    callback();return;
                }
                _this2.logError(_this2.id, 'ptz', callback);
            });
        }
    }, {
        key: 'zoomIn',
        value: function zoomIn(callback) {
            this._PTZ(callback, dhlib.enums.PTZ.PTZ_ZOOM_ADD, this.zoom_speed);
        }
    }, {
        key: 'zoomOut',
        value: function zoomOut(callback) {
            this._PTZ(callback, dhlib.enums.PTZ.PTZ_ZOOM_DEC, this.zoom_speed);
        }
    }, {
        key: 'focusIn',
        value: function focusIn(callback) {
            this._PTZ(callback, dhlib.enums.PTZ.PTZ_FOCUS_ADD, this.focus_speed);
        }
    }, {
        key: 'focusOut',
        value: function focusOut(callback) {
            this._PTZ(callback, dhlib.enums.PTZ.PTZ_FOCUS_DEC, this.focus_speed);
        }
    }, {
        key: 'apertureIn',
        value: function apertureIn(callback) {
            this._PTZ(callback, dhlib.enums.PTZ.PTZ_APERTURE_ADD, this.aperture_speed);
        }
    }, {
        key: 'apertureOut',
        value: function apertureOut(callback) {
            this._PTZ(callback, dhlib.enums.PTZ.PTZ_APERTURE_DEC, this.aperture_speed);
        }
    }, {
        key: 'move',
        value: function move(direction, callback) {
            if (!this.isDemo) {
                if (callback) process.nextTick(function () {
                    callback('not a demo');
                });
                return;
            }
            var _d = PTZ.Directions;
            switch (direction) {
                case _d.top:
                    direction = dhlib.enums.PTZ.PTZ_UP;
                    break;
                case _d.left:
                    direction = dhlib.enums.PTZ.PTZ_LEFT;
                    break;
                case _d.right:
                    direction = dhlib.enums.PTZ.PTZ_RIGHT;
                    break;
                case _d.down:
                    direction = dhlib.enums.PTZ.PTZ_DOWN;
                    break;
                default:
                    {
                        if (callback) process.nextTick(function () {
                            callback('cmd unsupport');
                        });
                        return;
                    }
            }
            if (direction === dhlib.enums.PTZ.PTZ_UP || direction === dhlib.enums.PTZ.PTZ_DOWN) {
                this._PTZ(callback, this._loginID, this.nvr_channel, direction, this.v_speed);
                return;
            }
            this._PTZ(callback, this._loginID, this.nvr_channel, direction, this.h_speed);
        }
    }, {
        key: 'moveToPoint',
        value: function moveToPoint(pt, cb) {
            if (!this.isDemo) {
                if (callback) process.nextTick(function () {
                    callback('not a demo');
                });
                return;
            }
            this._PTZ(cb, dhlib.enums.PTZ.PTZ_POINT_MOVE, pt, 0);
        }
    }, {
        key: 'setPoint',
        value: function setPoint(index, cb) {
            if (!this.isDemo) {
                if (callback) process.nextTick(function () {
                    callback('not a demo');
                });
                return;
            }
            this._PTZ(cb, dhlib, enums.PTZ.PTZ_POINT_SET, index, 0);
        }
    }]);

    return DHNVR;
}(DHIPC);

exports = module.exports = DHNVR;
//# sourceMappingURL=_dh_nvr.js.map