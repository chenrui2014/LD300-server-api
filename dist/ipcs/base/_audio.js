'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Created by Luky on 2017/7/5.
 */
// enum { 'G711', 'G726', 'AAC' }

var Audio = function () {
    function Audio() {
        _classCallCheck(this, Audio);
    }

    _createClass(Audio, [{
        key: 'connect',
        value: function connect() {
            throw new Error('未实现函数connect');
        }
    }, {
        key: 'disConnect',
        value: function disConnect() {
            throw new Error('未实现函数DisConnect');
        }
    }, {
        key: 'startTalk',
        value: function startTalk() {
            throw new Error('未实现函数talk');
        }
    }, {
        key: 'stopTalk',
        value: function stopTalk() {
            throw new Error('未实现函数stopTalk');
        }
    }, {
        key: 'setTalkData',
        value: function setTalkData(data, size) {
            throw new Error('未实现函数setTalkData');
        }
    }, {
        key: 'setVolume',
        value: function setVolume(pt) {
            throw new Error('未实现函数setVolume');
        }
    }, {
        key: 'config',
        get: function get() {
            throw new Error('未实现函数config');
        }
    }, {
        key: 'isConnected',
        get: function get() {
            throw new Error('未实现函数isConnect');
        }
    }]);

    return Audio;
}();

exports = module.exports = Audio;
//# sourceMappingURL=_audio.js.map