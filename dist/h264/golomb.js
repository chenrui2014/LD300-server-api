'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Created by Luky on 2017/8/3.
 */

var assert = require('assert');

// Exponential-Golomb buffer decoder

var ExpGolomb = function () {
    function ExpGolomb(data) {
        _classCallCheck(this, ExpGolomb);

        this._data = data;
        this._index = 0;
        this._bitLength = data.length * 8;
    }

    _createClass(ExpGolomb, [{
        key: 'destroy',
        value: function destroy() {
            this._data = null;
        }
    }, {
        key: 'skipBits',
        value: function skipBits(size) {
            // console.log(`  skip bits: size=${size}, ${this._index}.`);
            if (this.bitsAvailable < size) {
                throw new Error('no bytes available');
            }
            this._index += size;
        }
    }, {
        key: 'readBits',
        value: function readBits(size) {
            var moveIndex = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

            // console.log(`  read bits: size=${size}, ${this._index}.`);
            var result = this._getBits(size, this._index, moveIndex);
            // console.log(`    read bits: result=${result}`);
            return result;
        }
    }, {
        key: '_getBits',
        value: function _getBits(size, offsetBits) {
            var moveIndex = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

            if (this.bitsAvailable < size) {
                throw new Error('no bytes available');
            }
            var offset = offsetBits % 8;
            var byte = this._data[offsetBits / 8 | 0] & 0xff >>> offset;
            var bits = 8 - offset;
            if (bits >= size) {
                if (moveIndex) {
                    this._index += size;
                }
                return byte >> bits - size;
            } else {
                if (moveIndex) {
                    this._index += bits;
                }
                var nextSize = size - bits;
                return byte << nextSize | this._getBits(nextSize, offsetBits + bits, moveIndex);
            }
        }
    }, {
        key: 'skipLZ',
        value: function skipLZ(size) {
            var leadingZeroCount = 0;
            for (; leadingZeroCount < this._bitLength - this._index; ++leadingZeroCount) {
                if (0 !== this._getBits(1, this._index + leadingZeroCount, false)) {
                    //console.log(`  skip LZ  : size=${leadingZeroCount}, ${this._index}.`);
                    this._index += leadingZeroCount;
                    return leadingZeroCount;
                }
            }
            return leadingZeroCount;
        }
    }, {
        key: 'skipBit',
        value: function skipBit() {
            this.skipBits(1);
        }
    }, {
        key: 'skipByte',
        value: function skipByte() {
            this.skipBits(8);
        }
    }, {
        key: 'skipUEG',
        value: function skipUEG() {
            this.skipBits(1 + this.skipLZ());
        }
    }, {
        key: 'skipSEG',
        value: function skipSEG() {
            this.skipBits(1 + this.skipLZ());
        }
    }, {
        key: 'readUEG',
        value: function readUEG() {
            var prefix = this.skipLZ();
            return this.readBits(prefix + 1) - 1;
        }
    }, {
        key: 'readSEG',
        value: function readSEG() {
            var value = this.readUEG();
            if (0x01 & value) {
                // the number is odd if the low order bit is set
                return 1 + value >>> 1; // add 1 to make it even, and divide by 2
            } else {
                return -1 * (value >>> 1); // divide by two then make it negative
            }
        }
    }, {
        key: 'readBoolean',
        value: function readBoolean() {
            return 1 === this.readBits(1);
        }
    }, {
        key: 'readUByte',
        value: function readUByte() {
            return this.readBits(8);
        }
    }, {
        key: 'readUShort',
        value: function readUShort() {
            return this.readBits(16);
        }
    }, {
        key: 'readUInt',
        value: function readUInt() {
            return this.readBits(32);
        }
    }, {
        key: 'readU1',
        value: function readU1() {
            return this.readBits(1);
        }
    }, {
        key: 'readUN',
        value: function readUN(n) {
            var moveIndex = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

            return this.readBits(n, moveIndex);
        }
    }, {
        key: 'alignToByte',
        value: function alignToByte() {
            var n = -this.bitsAvailable & 7;
            if (n > 0) this.skipBits(n);
        }

        /**
         Calculate the log base 2 of the argument, rounded up.
         Zero or negative arguments return zero
         Idea from http://www.southwindsgames.com/blog/2009/01/19/fast-integer-log2-function-in-cc/
         */

    }, {
        key: 'bitsAvailable',
        get: function get() {
            return this._bitLength - this._index;
        }
    }, {
        key: 'index',
        get: function get() {
            return this._index;
        }
    }], [{
        key: 'intlog2',
        value: function intlog2(x) {
            var log = 0;
            if (x < 0) {
                x = 0;
            }
            while (x >> log > 0) {
                log++;
            }
            if (log > 0 && x === 1 << log - 1) {
                log--;
            }
            return log;
        }
    }]);

    return ExpGolomb;
}();

exports = module.exports = ExpGolomb;
//# sourceMappingURL=golomb.js.map