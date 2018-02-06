'use strict';

/**
 * Created by Luky on 2017/8/30.
 */

var Writable = require('stream').Writable;
var Parser = require('stream-parser');
var inherits = require('util').inherits;
var AdtsParser = require('./acc_adts_parser');

function AdtsDecoder() {
    if (!(this instanceof AdtsDecoder)) return new AdtsDecoder();
    Writable.call(this);
    //this.on('finish',this._onfinish);
    this.adts = null;
    this._bytes(7, this._onAdtsHeader);
    this.size = 0;
}

inherits(AdtsDecoder, Writable);
/**
 * Mixin `Parser`.
 */

Parser(AdtsDecoder.prototype);

AdtsDecoder.prototype._onAdtsHeader = function (buf) {
    var adts = AdtsParser.ParseADTSHeader(buf);
    if (this.adts === null) {
        this.adts = adts;
        this.emit('adts', buf);
    }
    if (!adts.protection_absent) this._skipBytes(2);
    /*console.log(this.size.toString(16));
    console.log(buf.toString('hex'));*/
    this._bytes(adts.acc_raw_data_length, this._onRawData);
};

AdtsDecoder.prototype._onRawData = function (rowData, cb) {
    this._bytes(7, this._onAdtsHeader);
    this.emit('data', rowData);
    //this.size+=rowData.length+7;
    cb();
};
/*
AdtsDecoder.prototype._onfinish=function () {

};
*/

exports = module.exports = AdtsDecoder;
//# sourceMappingURL=acc_adts_decoder.js.map