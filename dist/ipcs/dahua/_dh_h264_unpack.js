'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Created by Luky on 2017/7/2.
 */
var Transform = require('stream').Transform;
var assert = require('assert');
var naluPrefix = Buffer.from([0, 0, 1]);
var DHAV = Buffer.from([0x44, 0x48, 0x41, 0x56]);
var dhav = Buffer.from([0x64, 0x68, 0x61, 0x76]);
var emptyBuffer = Buffer.alloc(0);

var DHH264UnPick = function (_Transform) {
    _inherits(DHH264UnPick, _Transform);

    function DHH264UnPick() {
        var skipPrefix = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

        _classCallCheck(this, DHH264UnPick);

        var _this = _possibleConstructorReturn(this, (DHH264UnPick.__proto__ || Object.getPrototypeOf(DHH264UnPick)).call(this, { objectMode: true }));

        _this._c = emptyBuffer;
        _this._skip0001 = skipPrefix;
        return _this;
    }

    _createClass(DHH264UnPick, [{
        key: '_transform',
        value: function _transform(buf, enc, next) {
            /*next(null,buf.toString('hex')+'\r\n');
            return;*/
            if (buf.slice(0, 4).indexOf(DHAV) === 0) {
                buf = buf.slice(40); //DHAV和不知道是什么数据结构的数据
            }

            var _DHH264UnPick$findPre = DHH264UnPick.findPrefixAndSize(buf),
                _DHH264UnPick$findPre2 = _slicedToArray(_DHH264UnPick$findPre, 2),
                index = _DHH264UnPick$findPre2[0],
                size = _DHH264UnPick$findPre2[1];

            if (-1 === index) {
                //assert.ok(buf[4]!==0xfc);
                //console.log(buf.toString('utf8'));
                next();return;
            }
            if (this._c.length) {
                assert.ok(buf.slice(0, 4).indexOf(DHAV) === -1);
                this.push({ t: 'v', d: Buffer.concat([this._c, buf.slice(0, index)], this._c.length + index) });
            }
            this._c = buf.slice(index);
            index = 0;
            var ndhav = -1;
            if ((ndhav = this._c.lastIndexOf(dhav)) !== -1) {
                assert.ok(ndhav + 8 === this._c.length);
                this._c = this._c.slice(0, ndhav);
            }

            do {
                var _DHH264UnPick$findPre3 = DHH264UnPick.findPrefixAndSize(this._c, index + size + 1),
                    _DHH264UnPick$findPre4 = _slicedToArray(_DHH264UnPick$findPre3, 2),
                    index2 = _DHH264UnPick$findPre4[0],
                    size2 = _DHH264UnPick$findPre4[1];

                if (index2 === -1) {
                    if (ndhav === -1) {
                        this._c = this._c.slice(index + (this._skip0001 ? size : 0));
                        next();
                        return;
                    } else {
                        var _b = this._c.slice(index + (this._skip0001 ? size : 0));
                        this._c = emptyBuffer;
                        next(null, { t: 'v', d: _b });
                        return;
                    }
                }
                var b = this._c.slice(index + (this._skip0001 ? size : 0), index2);
                this.push({ t: 'v', d: b });
                index = index2;size = size2;
            } while (true);
        }
    }], [{
        key: 'findPrefixAndSize',
        value: function findPrefixAndSize(buff) {
            var start = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

            var index = buff.indexOf(naluPrefix, start);
            if (index > 0 && buff[index - 1] === 0) {
                return [index - 1, 4];
            }
            return [index, index !== -1 ? 3 : 0];
        }
    }]);

    return DHH264UnPick;
}(Transform);

exports = module.exports = DHH264UnPick;
//# sourceMappingURL=_dh_h264_unpack.js.map