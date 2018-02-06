'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Created by Luky on 2017/7/19.
 */

var Transform = require('stream').Transform;
var _ = require('lodash');
var assert = require('assert');
var EventEmitter = require('events').EventEmitter;

var List = function () {
    function List(capacity) {
        _classCallCheck(this, List);

        capacity = capacity || 512;
        this._buffer = Buffer.allocUnsafe(capacity);
        this._length = 0;
    }

    _createClass(List, [{
        key: 'copyTo',
        value: function copyTo(target, start) {
            if (!this._length) return 0;
            this._buffer.copy(target, start, 0, this.length);
            return this.length;
        }
    }, {
        key: 'clear',
        value: function clear() {
            this._length = 0;
        }
    }, {
        key: 'append',
        value: function append(buffer) {
            if (this._buffer.length - this._length < buffer.length) {
                console.warn('\u5185\u5B58\u589E\u957F(KB)' + this._buffer.length / 1024 + '=>' + (this._buffer.length + 3 * buffer.length) / 1024);
                var tmp = Buffer.allocUnsafe(this._buffer.length + 3 * buffer.length);
                this._buffer.copy(tmp, 0, 0, this._length);
                delete this._buffer;
                buffer.copy(tmp, this._length);
                this._buffer = tmp;
                this._length += buffer.length;
            } else {
                buffer.copy(this._buffer, this._length);
                this._length += buffer.length;
            }
        }
    }, {
        key: 'length',
        get: function get() {
            return this._length;
        }
    }]);

    return List;
}();

var Cache = function (_Transform) {
    _inherits(Cache, _Transform);

    function Cache() {
        var timeout = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
        var capacity = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
        var open = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

        _classCallCheck(this, Cache);

        var _this = _possibleConstructorReturn(this, (Cache.__proto__ || Object.getPrototypeOf(Cache)).call(this));

        _this._timeout = timeout;
        if (_this._timeout) {
            //不提供缓存功能的阀门，来的数据都丢掉
            _this._datas = new Array(timeout);
            capacity = capacity || 512 * timeout;
            capacity = Math.floor(capacity / timeout);
            for (var i = 0; i < timeout; i++) {
                _this._datas[i] = new List(capacity);
            }
        }
        _this._length = 0;
        _this._pos = 0;
        _this._lastTime = 0;
        _this._output = false;
        if (open) {
            _this.open();
        }
        return _this;
    }

    _createClass(Cache, [{
        key: 'open',
        value: function open() {
            this._output = true;
        }
    }, {
        key: 'close',
        value: function close() {
            this._output = false;
        }
    }, {
        key: '_transform',
        value: function _transform(buf, enc, next) {
            if (this._output) this.push(this.dispatch(buf));else this.append(buf);
            next();
        }
    }, {
        key: 'clear',
        value: function clear() {
            var current = curSecond();
            this._lastTime = this._lastTime || current;
            if (this._lastTime !== current && this._length) {
                for (var i = this._lastTime + 1, j = 0; i <= current && j < this._timeout; i++) {
                    var lst = this._datas[i % this._timeout];
                    this._length -= lst.length;
                    lst.clear();
                }
            }
            return current;
        }
    }, {
        key: 'append',
        value: function append(data) {
            if (!this._timeout) return;
            this._lastTime = this.clear();
            this._pos = this._lastTime % this._timeout;
            if (!data || !data.length) return;
            //console.log(`pos:${this._pos}`);
            console.log('\u4F4D\u7F6E' + this._pos + '\u5F53\u524D\u7F13\u5B58\u5927\u5C0F(KB)' + Math.floor(this._datas[this._pos].length / 1024) + ',\u5B9E\u9645\u5185\u5B58\u5927\u5C0F' + Math.floor(this._datas[this._pos]._buffer.length / 1024));
            this._datas[this._pos].append(data);
            this._length += data.length;
        }
    }, {
        key: 'dispatch',
        value: function dispatch(data) {
            if (!this._length) return data;
            var length = this._length + (data ? data.length : 0);
            var buffer = Buffer.allocUnsafe(length);
            var pos = this._pos,
                len = 0;
            for (var i = 0, p = (pos + 1) % this._timeout; i < this._timeout; i++) {
                var lst = this._datas[p];
                p = (p + 1) % this._timeout;
                len += lst.copyTo(buffer, len);
                lst.clear();
            }
            if (data) {
                data.copy(buffer, len);
            }
            this._length = 0;
            return buffer;
        }
    }]);

    return Cache;
}(Transform);

function curSecond() {
    return Math.floor(new Date().getTime() / 1000);
}

exports = module.exports = Cache;
//# sourceMappingURL=_valve_pipe.js.map