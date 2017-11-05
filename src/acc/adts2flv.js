/**
 * Created by Luky on 2017/8/30.
 */

const AdtsDecoder=require('./acc_adts_decoder');
const FLVEncoder=require('../flv/flv_encoder');
const Readable= require('stream').Readable;

class Adts2Flv extends Readable{
    constructor(stream){
        super();
        this._adtsDecoder=new AdtsDecoder();
        this._adtsDecoder.on('adts',(data)=>{
            this._flvEncoder.audioTagAVCPackage_AACSpecificConfig_ADST(data);
        });
        this._adtsDecoder.on('data',(data)=>{
            this._flvEncoder.audioTagAVCPackage_AACRowdata_ES(data);
        });
        this._in=stream;
        this._flvEncoder=new FLVEncoder(false,true);
        this._flvEncoder.on('data',(data)=>{
            this.push(data);
        });
        this._in.pipe(this._adtsDecoder);
    }

    _read(){

    }
}


exports=module.exports=Adts2Flv;