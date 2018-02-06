'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Created by Luky on 2017/7/7.
 */

var Vedio = function () {
    function Vedio() {
        _classCallCheck(this, Vedio);
    }

    _createClass(Vedio, [{
        key: 'connect',
        value: function connect() {
            throw new Error('未实现函数connect');
        }
    }, {
        key: 'disConnect',
        value: function disConnect() {
            throw new Error('未实现函数DisConnect');
        }
        //全部从辅码1流中获取，如果需要高精度请对应设置设备参数

    }, {
        key: 'realPlay',
        value: function realPlay() {
            throw new Error('未实现函数realPlay');
        }
    }, {
        key: 'stopRealPlay',
        value: function stopRealPlay() {
            throw new Error('未实现函数stopRealPlay');
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

    return Vedio;
}();

exports = module.exports = Vedio;
//# sourceMappingURL=_vedio.js.map