/**
 * Created by Luky on 2017/8/11.
 */

//const Transform=require('stream').Transform;
const Writable=require('stream').Writable;
const NALU=require('../../h264/h264_nalu_parser');
const SPSParser=require('../../h264/h264_sps_parser');
/*const PPSParser=require('../../h264/h264_pps_parser');
const SEIParser=require('../../h264/h264_sei_parser');
const SliceParser=require('../../h264/h264_slice_parser');
const POC=require('../../h264/h264_poc');*/
const config=global.server_config||require('../../config/config');
const FLV=require('../../flv/flv_encoder');
const _=require('lodash');
const assert=require('assert');
const ADTS=require('../../acc/acc_adts_parser');
const h264Prefix=Buffer.from([0,0,1]);
/*let fs=require('fs');
let file=fs.createWriteStream('d:/audio_flv.test.aac',{
    flags: 'w',
    encoding: null,
    fd: null,
    mode: 0o666,
    autoClose: true
});*/

class H264AndAACCache extends Writable{
    constructor(video=true,audio=false){
        super({ objectMode: true });
        this._hasVideo=video;
        this._hasAudio=audio;
        this.clear();
    }

    clear(){
        this._sps=null;
        this._pps=null;
        this._adts=null;
        //this._sei=null;
        //sei先不管
        this._slices=[];
        this._ready=false;
        this._clients=[];
        let metadata={
            //文件部分
            duration:0,filesize:0,
            //扩展部分flv.js
            hasVideo:this._hasVideo,
            hasAudio:this._hasAudio,
            //其他
            title: 'lambda 0.1',encoder: 'lambda',
        };
        if(this._hasVideo){
            metadata.videocodecid=FLV.VideoEncodings.AVC;//视频编码方式
            metadata.framerate= 100;//看看100是否能加快直播速度25;//视频帧率
            metadata.width=0;//视频宽度
            metadata.height=0;//视频高度
            metadata.videodatarate= 0;//视频码率
        }
        if(this._hasAudio){
            metadata.audiocodecid=FLV.AudioEncodings.AAC;//音频编码方式
            metadata.audiodatarate=0;//音频采样率,
            metadata.audiosamplerate=0;//音频采样率,
            metadata.audiosamplesize=16;//音频采样位数，采样长度，采样深度
            metadata.stereo=false;//立体声,
        }
        this.metadata=metadata;
    }

    removeClient(client){
        _.remove(this._clients,(c)=>{return c===client});
    }

    addClient(client){
        client.time0=0;
        this._clients.push(client);
        if(this._ready){
            this._sendHead([client]);
        }
    }

    _sendAudio(slice,clients){
        //if(this._clients.length>0)file.write(slice.data);
        _.each(clients||this._clients,(cb)=>{
            let timestamp=0;
            if(slice.dataType==='data'){
                const adts=slice.adts;
                timestamp=adts.blocks*1024*1000/adts.freq;
                cb.audioDuration=cb.audioDuration||0;
                this._audioDuration+=timestamp;
            }
            cb(FLV.audioTagAVCPackage_AACRowdata_ADST(slice.data,timestamp),slice);
        });
    }

    _sendVideo(slice,clients){
        _.each(clients||this._clients,(cb)=>{
            cb(H264AndAACCache._toVedioTagAVCPackageNALU(slice.data,slice.key,H264AndAACCache._getTimestamp(cb,slice)),slice);
        });
    }

    static _getTimestamp(client,slice){
        //if(!client.time0)console.log(`开始时间${slice.time}`);
        client.time0=client.time0||slice.time;
        //返回0，可以即时播放，这里需要通过时间戳加快播放速度
        return /*slice.time-client.time0*/0;
    }

    _sendHead(cbs){
        _.each(cbs,(cb)=>{
            cb(FLV.headBytes(this._hasVideo,this._hasAudio),{type:'header'});
            cb(FLV.scriptTag(this.metadata),{type:'tag',tagType:'script'});
            if(null!==this._sps&&null!==this._pps)
                cb(FLV.VedioTagAVCPacket_DecorderConfigurationRecord([this._sps],[this._pps],this._avc.profile,this._avc.profile_compatibility,this._avc.level),{type:'tag',tagType:'video',dataType:'head'});
            if(null!==this._adts){
                cb(FLV.audioTagAVCPackage_AACSpecificConfig_ADST(this._adts),{type:'tag',tagType:'audio',dataType:'head'});
            }
        });
        for (let j = 0; j < this._slices.length; j++) {
            let slicei=this._slices[j];
            if(slicei.tagType==='video'){
                this._sendVideo(slicei);
            }
            else{
                this._sendAudio(slicei);
            }
        }
    }

    /*_toSequenceHander() {
        if(this._sei){
            this.push(FLV.VedioTagAVCPackageNALU(0,0,this._SEIBuffer,FLV.FrameTypes.InterFrame));
        }
    }*/

    static _toVedioTagAVCPackageNALU(slice,iFrame,timestamp){
        return FLV.VedioTagAVCPackageNALU(slice, (iFrame?FLV.FrameTypes.KeyFrame:FLV.FrameTypes.InterFrame),timestamp);
    }

    _pushAudioADTS(data){
        let adts=ADTS.ParseADTSHeader(data);
        this._adts=data;
        this.metadata.audiosamplerate=adts.freq;
        this.metadata.stereo=adts.channel>1;
        let slice={type:'tag',tagType:'audio',dataType:'data',codec:'acc',adts:adts,data:data,time:config.runtimeLength()};
        if(!this._hasVideo&&this._slices.length>50){
            this._slices=this._slices.slice(25);
        }
        this._slices.push(slice);
        if(!this._ready&&this._VedioReady){
            this._ready=true;
            this._sendHead(this._clients);
            return;
        }
        if(this._ready)this._sendAudio(slice);
    }

    get _AudioReady(){
        return !this._hasAudio||this._adts!==null;
    }

    get _VedioReady(){
        return !this._hasVideo||(this._sps!==null&&this._pps!==null);
    }

    _pushVedioH264(nalu){
        let unit=new NALU(nalu);
        if(unit.type===NALU.TYPES.SPS){
            if(null!==this._sps) return;
            let sps=SPSParser.parseSPS(nalu);
            this.metadata.width=sps.present_size.width;
            this.metadata.height=sps.present_size.height;
            this._avc={
                profile:sps.profile_idc,
                profile_compatibility:sps.profile_compatibility,
                level:sps.level_idc
            };
            this._sps=nalu;
            return;
        }
        if(unit.type===NALU.TYPES.PPS)
        {
            this._pps=nalu;
            return;
        }
        if(unit.type===NALU.TYPES.SEI){
            return;
        }
        const isIDR=unit.key_frame;
        let slice={type:'tag',tagType:'video',dataType:'data',codec:'h264',data:nalu,key:isIDR,time:config.runtimeLength()};
        if(isIDR){
            this._slices=[slice];
            if(!this._ready&&this._AudioReady){
                this._ready=true;
                this._sendHead(this._clients);
                return;
            }
        }
        else{
            this._slices.push(slice);
        }
        if(this._ready)this._sendVideo(slice);
    }

    _write(data_temp,enc,cb){
        //不知道为什么数据会被篡改，所以复制一份
        let data=Buffer.from(data_temp);
        if(this._hasVideo){
            let index;
            if((index=data.slice(0,4).indexOf(h264Prefix))!==-1)this._pushVedioH264(data.slice(index+3));
        }
        if(this._hasAudio){
            if(data[0] === 0xff&&((data[1]&0xf0)===0xf0)) this._pushAudioADTS(data);
        }
        cb();
    }
}

exports=module.exports=H264AndAACCache;
