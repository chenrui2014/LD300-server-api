/**
 * Created by Luky on 2017/8/6.
 */

const Transform=require('stream').Transform;
const NALU=require('../../h264/h264_nalu_parser');
const SPSParser=require('../../h264/h264_sps_parser');
const PPSParser=require('../../h264/h264_pps_parser');
const SEIParser=require('../../h264/h264_sei_parser');
const SliceParser=require('../../h264/h264_slice_parser');
const POC=require('../../h264/h264_poc');
const config=global.server_config||require('../../config/config');
const FLV=require('../../flv/flv_encoder');
const _=require('lodash');
const drop_span=5;

const cacheType={
    'IDR':0,
    'Frame_time':1,
    'Frame_count':2
};

class H264Switch extends Transform{
    constructor(cacheType='IDR',dropOption = 0){
        super();
        this._out=0;
        //this._h264=new H264Decoder();
        this._amf2={
            duration: 0,
            width: 0,
            height: 0,
            videodatarate: 0,
            framerate: 100,
            videocodecid: FLV.VideoEncodings.AVC,
            title: 'lambda 0.1',
            encoder: 'lambda',
            filesize: 0
        };
        this._cacheType=H264Switch.getCacheType(cacheType);
        this._cache=[];
        if(this._cacheType===cacheType.IDR){
            this._cacheOption= _.clamp(dropOption,1,3) ;
            this._push=this._pushTypeIDR;
            this._transform=this._transformIDR;
        }
        else{
            this._transform=this._transformOther;
            this._size=0;
/*            this._head={_next:null};
            this._head._pre=this._head;*/
            if(this._cacheType===cacheType.Frame_time){
                this._push=this._pushTypeFrameTime;
                this._cacheOption= _.clamp(dropOption,500,3000) ;
                this._htime=null;
            }
            else if(this._cacheType===cacheType.Frame_count){
                this._push=this._pushTypeFrameCount();
                this._cacheOption= _.clamp(dropOption,10,75) ;
            }
        }

        this._SPSTable=[];
        this._SPSBuffers=[];
        this._PPSTable=[];
        this._PPSBuffers=[];
        this._SEI={};
        this._SEIBuffer=null;
        this._poc=new POC();
    }

    static get CacheType(){
        return cacheType;
    }

    static getCacheType(c){
        switch(c.toUpperCase()){
            case 'IDR':return 0;
            case 'Frame-time':return 1;
            case 'Frame-count':return 2;
        }
        return 0;
    }

    open(){
        this._out=1;
    }

    close(){
        this._out=0;
    }

    _isIDR(slice){
        return slice.nal_unit_type_string==='IDR';
    }

    get _isEmpty(){
        return this._head._next=null;
    }

    _pushTypeIDR(slice,buf){
        let p={
            slice:slice,
            buf:buf,
            idr:this._isIDR(slice)
        };
        if(p.idr){//按组存放
            this._cache.push([p]);
        }
        else{
            _.last(this._cache).push(p);
        }
        if(this._cache.length>this._cacheOption){
            this._size-=this._cache[0].length;
            this._cache.splice(0,1);
        }
    }

    _link(p){
        if(p.idr){//按组存放
            p.inorder=true;
            p.maxPOC=Math.min(p.cid,p.cid2);
            this._cache.push([p]);
        }
        else{
            let last=_.last(this._cache);
            last.push(p);
            if(Math.min(p.cid,p.cid2)<last[0].maxPOC){
                last[0].inorder=false;
            }
        }

/*        p._pre=this._head._pre;
        this._head._pre.next=p;
        this._head._pre=p;*/
        this._size++;
    }

    _unlinkByTime(){
        let cur=config.runtimeLength();
        if(this._cacheOption-this._htime<500){
            return;
        }
        let del=cur-this._cacheOption;
        let i=0,count=0;
        while(_.last(this._cache[i]).time<=del){
            count+=this._cache[i].length;i++;
        }
        if(i>0){
            this._cache.splice(0,i);
            this._size-=count;
        }

    }

    _unlinkByCount(){
        if(this._size*1.25<this._cacheOption){
            return;
        }
        let del=this._size-this._cacheOption;
        let i=0,count=0,countpre=0;
        do{
            countpre=count;
            count+=this._cache[i].length;
        }while(count<=del);
        if(del-countpre<=3){//如果剩下的只有一个I帧甚至3个帧一并删除
            this._cache.splice(0,i+1);
            this._size-=count;
            del=0;
        }
        else if(i>0){
            this._cache.splice(0,i);
            this._size-=countpre;
            del-=countpre;
        }
        if(!del) return;
        //............
    }

    _pushTypeFrameTime(slice,buf){
        this._htime=this._htime||config.runtimeLength();
        this._link({
            time:config.runtimeLength(),
            slice:slice,
            cid:slice.poc.sb,
            cid2:slice.poc.sb_other,
            sid:slice.poc.pic_num,
            buf:buf,
            idr:this._isIDR(slice),
            _next:null
        });
        this._unlinkByTime();
    }

    _pushTypeFrameCount(slice,buf){
        this._link({
            slice:slice,
            cid:slice.poc.sb,
            sid:slice.poc.pic_num,
            buf:buf,
            idr:this._isIDR(slice),
            _next:null
        });
        this._unlinkByCount();
    }

    _parseNALU(nalu){
        let unit=new NALU(nalu);
        switch(unit.type){
            case NALU.TYPES.SPS:
            {
                let ret=_.defaults(SPSParser.parseSPS(nalu),{nalu:unit});
                if(this._amf2.width===0){
                    this._amf2.width=ret.present_size.width;
                    this._amf2.height=ret.present_size.height;
                }
                this._SPSTable[ret.sps_id]=ret;
                this._SPSBuffers[ret.sps_id]=nalu;
                return ret;
            }
            case NALU.TYPES.PPS:
            {
                let ret=_.defaults(PPSParser.parsePPS(nalu,this._SPSTable),{nalu:unit});
                this._PPSTable[ret.pps_id]=ret;
                this._PPSBuffers[ret.pps_id]=nalu;
                return ret;
            }
            case NALU.TYPES.SEI:{
                //一般不需要解析
                this._SEIBuffer=nalu;
                return this._SEI=_.defaults(SEIParser.parseSEI(nalu),{nalu:unit});
            }
            case NALU.TYPES.IDR:
            case NALU.TYPES.SLICE:
            case NALU.TYPES.AUXILIARY_SLICE:
                if(!this._isIDRType){
                    let slice=_.defaults(SliceParser.parseSlice(nalu,this._SPSTable,this._PPSTable,this._SEI||{}),{nalu:unit});
                    this._poc.initPOC(slice,this._SPSTable[slice.sps_id]);
                    SEIParser.resetSEI(this._SEI);
                    return slice;
                }
        }
        return {nalu:unit};
    }

    _transformOther(nal,enc,next){

    }

    _transformIDR(nalu,enc,next){
        const info=this._parseNALU(nalu);

        switch(this._out){
            case 0:
                if(info.nalu.nal_unit_type_string==='SLICE'||info.nalu.nal_unit_type_string==='IDR'){
                    this._push(info,nalu);
                }
                return next();
            case 1:
                this.push(FLV.headBytes());
                this.push(FLV.scriptTag(this._amf2));
                if(this._cache.length) {
                    this._pushSequenceHander();
                    for(let i=0;i<this._cache.length;i++){
                        let slices=this._cache[i];
                        for(let j=0;j<slices.length;j++){
                            this.push(FLV.VedioTagAVCPackageNALU(0,0,slices[j].buf,(slices.idr?FLV.FrameTypes.KeyFrame:FLV.FrameTypes.InterFrame)));
                        }
                    }
                    this._cache=[];
                }
                this._out=2;
                return next();
            case 2:
                if(info.nalu.nal_unit_type_string==='IDR'){
                    this._pushSequenceHander();
                    this.push(FLV.VedioTagAVCPackageNALU(0,0,nalu,FLV.FrameTypes.KeyFrame));
                }
                else if(info.nalu.nal_unit_type_string==='SLICE'){
                    this.push(FLV.VedioTagAVCPackageNALU(0,0,nalu,FLV.FrameTypes.InterFrame));
                }

                return next();
        }
        next();
    }

}


exports=module.exports=H264Switch;
