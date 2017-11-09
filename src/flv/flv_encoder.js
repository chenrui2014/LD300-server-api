/**
 * Created by Luky on 2017/8/6.
 */
const _=require('lodash');
const amf=require('amf');
const SPSParser=require('../h264/h264_sps_parser');
const ADTS=require('../acc/acc_adts_parser');
const EventEmitter=require('events').EventEmitter;
const h264Prefix=Buffer.from([0,0,1]);

const frameType={
    'KeyFrame':1,
    'InterFrame':2,
    'DisposableInter':3,
    'GeneratedKeyFrame':4,
    'VedioInfo':5
};

const audioCoding={
    'ADPCM':1,
    'AAC':10,
    'MP3':2,
    'MP3_8HZ':14
};

const  AVCPackageType={
    'SequenceHeader':0,
    'NALU':1,
    'EndOfSequence':2
};

const videoConding={
    'JEPG':1,
    'SorensonH263':2,
    'ScreenVideo':3,
    'On2VP6':4,
    'On2VPWithAlpha':5,
    'ScreenVideoV2':6,
    'AVC':7
};

class FLVEncoder extends EventEmitter{
    constructor(video=true,audio=false){
        super();
        this._hasVideo=video;
        this._hasAudio=audio;
        this._headTags=null;
        this._slices=[];
        this._adst=null;
        this._sps=null;
        this._ready=(video-0)+(audio-0);
        this._videoDuration=0;
        this._audioDuration=0;
        this._metadata={
            //文件部分
            duration:0,filesize:0,
            //扩展部分flv.js
            hasVideo:this._hasVideo,
            hasAudio:this._hasAudio,
            //其他
            title: 'lambda 0.1',encoder: 'lambda',
        };
        this.clients=[];
        this.on('newListener', this._newListener.bind(this));
        this.on('removeListener', this._removeListener.bind(this));
    }

    get ready(){
        return this._ready<=0;
    }

    emitHeadTag(){
        if(!this.ready) return false;
        this._headTags=true;
        this.emit('data',FLVEncoder.headBytes(this._hasVideo,this._hasAudio));
        this.emit('data',FLVEncoder.scriptTag(this._metadata));
        if(this._hasVideo)this.emit('data',FLVEncoder.VedioTagAVCPacket_DecorderConfigurationRecord(this._sps,this._pps,this._profile,this._profile_compatibility,this._level));
        if(this._hasAudio)this.emit('data',FLVEncoder.audioTagAVCPackage_AACSpecificConfig_ADST(this._adst));
        return true;
    }

    _setVedioMetaData(codeid,width,height,fps=0,datarate=0){
        this._metadata.videocodecid=codeid;
        this._metadata.width=width;
        this._metadata.height=height;
        this._metadata.videodatarate=datarate;
        this._metadata.framerate=fps||25;
        /*//视频部分
        videocodecid: videoConding.AVC,//视频编码方式
        framerate: 25,//视频帧率
        width:0,//视频宽度
        height:0,//视频高度
        videodatarate: 0,//视频码率*/
    }

    _getVedioTimeTamp(){
        let inc=1000/this._metadata.framerate;
        let ret=this._videoDuration;
        this._videoDuration+=inc;
        return ret;
    }

    VedioTagAVCPacket_DecorderConfigurationRecord(sps,pps,fps){
        if(sps.length===0||pps.length===0){
            throw new RangeError('sps needed,pps needed');
        }
        this._sps=sps;
        this._pps=pps;
        this._setVedioMetaData(videoConding.AVC,sps.present_size.width,sps.present_size.height,fps);
        const spsObj=SPSParser.parseSPS(sps[0]);
        this._profile=spsObj.profile_idc;
        this._profile_compatibility=spsObj.profile_compatibility;
        this._level=spsObj.level_idc;
        this._ready--;
    }

    emitData(buf,timestamp){
        if(!this._headTags&&!this.emitHeadTag()){
            return;
        }
        //先简单实现
        this.emit('data',buf);
        //this._slices.push(buf);
    }

    VedioTagAVCPackageNALU(nalu,_frameType=-1,timestamp=-1){
        if(_frameType===-1){
            let index=nalu.indexOf(h264Prefix);
            nalu=nalu.slice(index+3);
            let unit=new NALU(nalu);
            _frameType=unit.key_frame?frameType.KeyFrame:frameType.InterFrame;
        }
        if(timestamp===-1)timestamp=this._getVedioTimeTamp();
        let ret=FLVEncoder.VedioTagAVCPackageNALU(nalu,_frameType,timestamp);
        this.emitData(ret,timestamp);
        return ret;
    }

    _getAudioTimeStamp(ESSize=1){
        let inc=ESSize*this._metadata._frame_size*1000/this._metadata.audiosamplerate;
        let ret=this._audioDuration;
        this._audioDuration+=inc;
        return ret;
    }
    
    _setAudioMetaData(codeid,samplerate,bit,stero,datarate=0){
        //音频部分
        this._metadata.audiocodecid=codeid;
        this._metadata.audiodatarate=datarate;
        this._metadata.audiosamplerate=samplerate;
        this._metadata.stereo=!!stero;
        this._metadata.audiosamplesize=bit;
        this._frame_size=1024;
        this._audioInc=0;
    }

    audioTagAVCPackage_AACSpecificConfig_ADST(data) {
        if(null!==this._adst) return;
        this._adst=data.slice(0,9);
        const adst=ADTS.ParseADTSHeader(data);
        this._setAudioMetaData(audioCoding.AAC,adst.freq,16,adst.channel>1);
        this._adstHeadSize=adst.acc_raw_data_index;
        this._ready--;
    }

    audioTagAVCPackage_AACRowdata_ADST(data,_timestamp=-1){
        let adts=ADTS.ParseADTSHeader(data);
        if(_timestamp===-1)_timestamp=this._getAudioTimeStamp(adts.blocks);
        return this.audioTagAVCPackage_AACRowdata_ES(data.slice(adts.acc_raw_data_index,adts.acc_raw_data_length),_timestamp);
    }

    audioTagAVCPackage_AACRowdata_ES(data,_timestamp=-1){
        if(_timestamp===-1)_timestamp=this._getAudioTimeStamp();
        let ret=FLVEncoder.audioTagAVCPackage_AACRowdata_ES(data,_timestamp);
        this.emitData(ret,_timestamp);
        return ret;
    }

    static headBytes(video=true,audio=false){
        let type=0;
        if(video){
            type|=0x01;
        }
        if(audio){
            type|=0x04;
        }
        let head=[0x46,0x4c,0x56,0x01,type,0x00,0x00,0x00,0x09,0x00,0x00,0x00,0x00];
        return Buffer.from(head);
    }

    static scriptTag(obj){
        let arr=[];
        _.defaults(arr,obj);
        arr.length=_.keys(obj).length;
        let amf1=Buffer.from([0x02,0x00,0x0a,0x6f,0x6e,0x4d,0x65,0x74,0x61,0x44,0x61,0x74,0x61]);
        let amf2Buf=Buffer.allocUnsafe(400);
        let info={};
        amf.write(amf2Buf,arr,info);
        let len=amf1.length+info.byteLength;
        let head=FLVEncoder._tagHead(0x12,len,0);
        let tail=FLVEncoder._tagTail(len);
        let buf=Buffer.allocUnsafe(head.length+tail.length+len);
        head.copy(buf);
        let offset=head.length;
        amf1.copy(buf,offset);offset+=amf1.length;
        amf2Buf.copy(buf,offset,0,info.byteLength);offset+=info.byteLength;
        tail.copy(buf,offset);
        return buf;
    }

    static _calcTimestamp(timestamp){
        return ((timestamp&0xffffff)<<8)
            +((timestamp&0xff000000)>>24);
    }

    static setTimestamp(slice,timestamp){
        timestamp=FLVEncoder._calcTimestamp(timestamp);
        slice.writeUInt32BE(timestamp,4);
        return slice;
    }

    static _tagHead(type,dataSize,timestamp){
        timestamp=FLVEncoder._calcTimestamp(timestamp);
        let head=Buffer.from([
            0x00,
            0x00,0x00,0x00,
            0x00,0x00,0x00,
            0x00,
            0x00,0x00,0x00]);
        head.writeUInt32BE(dataSize,0);
        head[0]=type;
        head.writeUInt32BE(timestamp,4);
        return head;
    }

    static _tagTail(datasize){
        let lenBuffer=Buffer.allocUnsafe(4);
        lenBuffer.writeUInt32BE(datasize+11,0);
        return lenBuffer;
    }

    static get FrameTypes(){
        return frameType;
    }

    static get AudioEncodings(){
        return audioCoding;
    }

    static get VideoEncodings(){
        return videoConding;
    }

    static VedioTagAVCPackage_EndOfSequence(){
        //0900000400000000000000020000000000000f
        return Buffer.from([
            0x09,0x00,0x00,0x04,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
            0x02,0x00,0x00,0x00,
            0x00,0x00,0x00,0x0f]);
/*        let data=Buffer.from([AVCPackageType.EndOfSequence,0x00,0x00,0x00]);
        let head=FLVEncoder._tagHead(0x09,0,0,data.length);
        let tail=FLVEncoder._tagTail(data.length);
        let buf=Buffer.allocUnsafe(head.length+data.length+tail.length);
        head.copy(buf,0);
        data.copy(buf,head.length);
        tail.copy(buf,head.length+data.length);
        return buf;*/
    }

    static VedioTagAVCPacket_DecorderConfigurationRecord(sps,pps,profile,profile_compatibility,level){
        /*console.log(profile);
        console.log(profile_compatibility);
        console.log(level);*/
        if(sps.length===0||pps.length===0){
            throw new RangeError('sps needed,pps needed');
        }
        if(profile==null){
            const spsObj=SPSParser.parseSPS(sps[0]);
            profile=spsObj.profile_idc;
            profile_compatibility=spsObj.profile_compatibility;
            level=spsObj.level_idc;
        }
        let size=1+4+7+2*sps.length+2*pps.length;
        for(let i=0;i<sps.length;i++){
            size+=sps[i].length;
        }
        for(let i=0;i<pps.length;i++){
            size+=pps[i].length;
        }
        let head=FLVEncoder._tagHead(0x09,size,0);
        let tail=FLVEncoder._tagTail(size);
        let buf=Buffer.allocUnsafe(head.length+size+tail.length);
        head.copy(buf,0);
        let offset=head.length;
        //经测试，帧类型为frameType.KeyFrame
        //buf.writeUInt8((frameType.VedioInfo<<4)+videoConding.AVC,offset++);
        buf.writeUInt8((frameType.KeyFrame<<4)+videoConding.AVC,offset++);
        buf.writeUInt32BE(/*AVCPackageType.SequenceHeader<<24*/0,offset);offset+=4;
        buf.writeUInt8(1,offset++);
        buf.writeUInt8(profile,offset++);
        buf.writeUInt8(profile_compatibility,offset++);
        buf.writeUInt8(level,offset++);
        buf.writeUInt8(0xff,offset++);
        buf.writeUInt8(0xe0|sps.length,offset++);
        for(let i=0;i<sps.length;i++){
            let spsi=sps[i];
            buf.writeUInt16BE(spsi.length,offset);offset+=2;
            spsi.copy(buf,offset);offset+=spsi.length;
        }
        buf.writeUInt8(pps.length,offset++);
        for(let i=0;i<pps.length;i++){
            let ppsi=pps[i];
            buf.writeUInt16BE(ppsi.length,offset);offset+=2;
            ppsi.copy(buf,offset);offset+=ppsi.length;
        }
        tail.copy(buf,offset);
        //console.log(buf.toString('hex'));
        return buf;
    }

    static VedioTagAVCPackageNALU(data,frameType,timestamp){
        const datasize=data.length+5+4;
        let head=FLVEncoder._tagHead(0x09,datasize,timestamp);
        let tail=FLVEncoder._tagTail(datasize);
        let buf=Buffer.allocUnsafe(datasize+head.length+tail.length);
        head.copy(buf);
        let offset=head.length;
        buf.writeUInt8((frameType<<4)+videoConding.AVC,offset++);
        buf.writeUInt32BE(0,offset);//AVCPacketType+CompostionTime
        buf.writeUInt8(AVCPackageType.NALU,offset);offset+=4;
        buf.writeUInt32BE(data.length,offset);offset+=4;
        data.copy(buf,offset);offset+=data.length;
        tail.copy(buf,offset);
        return buf;
    }

    /**
     * If the SoundFormat indicates AAC, the SoundType should be 1 (stereo) and the SoundRate should be 3 (44 kHz).
     However, this does not mean that AAC audio in FLV is always stereo, 44 kHz data. Instead, the Flash Player ignores
     these values and extracts the channel and sample rate data is encoded in the AAC bit stream.
     */

    static audioTagAVCPackage_AACRowdata_ADST(data,_timestamp){
        let adts=ADTS.ParseADTSHeader(data);
        return FLVEncoder.audioTagAVCPackage_AACRowdata_ES(data.slice(adts.acc_raw_data_index),_timestamp);
    }

    static audioTagAVCPackage_AACRowdata_ES(data,_timestamp){
        const datasize=2+data.length;
        let head=FLVEncoder._tagHead(0x08,datasize,_timestamp);
        let tail=FLVEncoder._tagTail(datasize);
        let buf=Buffer.allocUnsafe(datasize+head.length+tail.length);
        head.copy(buf);
        let offset=head.length;
        //10101111
        buf.writeUInt8(0xaf,offset++);//AAC 44hz 16bit sndstereo
        buf.writeUInt8(0x01,offset++);//acc raw
        data.copy(buf,offset);offset+=data.length;
        tail.copy(buf,offset);
        return buf;
    }

    static audioTagAVCPackage_AACSpecificConfig_ADST(data){
        let adts=ADTS.ParseADTSHeader(data);
        let b1=((adts.profile+1)<<3)|((adts.freqIndex&0xe)>>1);
        let b2=((adts.freqIndex&0x1)<<7)|(adts.channel<<3);
        const datasize=4/*+3*/;
        let head=FLVEncoder._tagHead(0x08,datasize,0);
        let tail=FLVEncoder._tagTail(datasize);
        let buf=Buffer.allocUnsafe(datasize+head.length+tail.length);
        head.copy(buf);
        let offset=head.length;
        buf.writeUInt8(0xaf,offset++);//AAC 44hz 16bit sndstereo
        buf.writeUInt8(0x00,offset++);//acc sequence header
        buf.writeUInt8(b1,offset++);
        buf.writeUInt8(b2,offset++);
/*        buf.writeUInt8(0x56,offset++);
        buf.writeUInt8(0xE5,offset++);
        buf.writeUInt8(0x00,offset++);*/
        //0x56 0xE5 0x00 SBR
        tail.copy(buf,offset);
        return buf;
    }
}

exports=module.exports=FLVEncoder;