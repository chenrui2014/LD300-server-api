/**
 * Created by Luky on 2017/8/3.
 */

const assert=require('assert');

// Exponential-Golomb buffer decoder
class ExpGolomb {

    constructor(data) {
        this._data=data;
        this._index=0;
        this._bitLength = data.length* 8;
    }

    destroy(){
        this._data=null;
    }

    get bitsAvailable() {
        return this._bitLength - this._index;
    }

    get index(){
        return this._index;
    }

    skipBits(size){
        // console.log(`  skip bits: size=${size}, ${this._index}.`);
        if (this.bitsAvailable < size) {
            throw new Error('no bytes available');
        }
        this._index += size;
    }

    readBits(size,moveIndex=true) {
        // console.log(`  read bits: size=${size}, ${this._index}.`);
        const result = this._getBits(size, this._index,moveIndex);
        // console.log(`    read bits: result=${result}`);
        return result;
    }

    _getBits(size, offsetBits, moveIndex=true){
        if (this.bitsAvailable < size) {
            throw new Error('no bytes available');
        }
        const offset = offsetBits % 8;
        const byte = this._data[(offsetBits / 8) | 0] & (0xff >>> offset);
        const bits = 8 - offset;
        if (bits >= size) {
            if (moveIndex) {
                this._index += size;
            }
            return byte >> (bits - size);
        } else {
            if (moveIndex) {
                this._index += bits;
            }
            const nextSize = size - bits;
            return (byte << nextSize) | this._getBits(nextSize, offsetBits + bits, moveIndex);
        }
    }

    skipLZ(size) {
        let leadingZeroCount=0;
        for (; leadingZeroCount < this._bitLength - this._index; ++leadingZeroCount) {
            if (0 !== this._getBits(1, this._index + leadingZeroCount, false)) {
                //console.log(`  skip LZ  : size=${leadingZeroCount}, ${this._index}.`);
                this._index += leadingZeroCount;
                return leadingZeroCount;
            }
        }
        return leadingZeroCount;
    }

    skipBit(){
        this.skipBits(1);
    }

    skipByte(){
        this.skipBits(8);
    }

    skipUEG() {
        this.skipBits(1 + this.skipLZ());
    }

    skipSEG(){
        this.skipBits(1 + this.skipLZ());
    }

    readUEG(){
        const prefix = this.skipLZ();
        return this.readBits(prefix + 1) - 1;
    }

    readSEG(){
        const value = this.readUEG();
        if (0x01 & value) {
            // the number is odd if the low order bit is set
            return (1 + value) >>> 1; // add 1 to make it even, and divide by 2
        } else {
            return -1 * (value >>> 1); // divide by two then make it negative
        }
    }

    readBoolean() {
        return 1 === this.readBits(1);
    }

    readUByte(){
        return this.readBits(8);
    }

    readUShort(){
        return this.readBits(16);
    }

    readUInt(){
        return this.readBits(32);
    }

    readU1(){
        return this.readBits(1);
    }

    readUN(n,moveIndex=true){
        return this.readBits(n,moveIndex);
    }

    alignToByte(){
        let n=(-this.bitsAvailable)&7;
        if(n>0) this.skipBits(n);
    }

    /**
     Calculate the log base 2 of the argument, rounded up.
     Zero or negative arguments return zero
     Idea from http://www.southwindsgames.com/blog/2009/01/19/fast-integer-log2-function-in-cc/
     */
    static intlog2(x)
    {
        let log = 0;
        if (x < 0) { x = 0; }
        while ((x >> log) > 0)
        {
            log++;
        }
        if (log > 0 && x === 1<<(log-1)) { log--; }
        return log;
    }
}

exports=module.exports=ExpGolomb;