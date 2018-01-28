/**
 * Created by Luky on 2017/7/1.
 */
const IPC=require('../base/ipc');
const Onvif=require('../onvif/onvif_ipc');
const _=require('lodash');
const dhok=require('./dh_init');
const dhlib=require('./dhnetsdk');
const globalConfig=global.server_config||require('../../config/config');
const config=globalConfig.getConfig('dh_config');
const ref=require('ref');
//const isLinux=process.platform.indexOf('win')===-1;
const assert=require('assert');
const ArrayType=require('ref-array');
//const Mix=require('../stream/stream_ffmpeg_pipe');
//const timeSpan=require('../../TimeSpan');
//const DHH264UnPack=require('./_dh_h264_unpack');
//const wchar_t = require('ref-wchar');
const fs = require('fs');
const acc=require('../../acc/acc_adts_parser');
const DHAV=Buffer.from([0x44,0x48,0x41,0x56]);
const dhav=Buffer.from([0x64,0x68,0x61,0x76]);
const h264Prefix=Buffer.from([0,0,0,1]);
const aacPrefix=Buffer.from([0xff]);
const {Parser} =require('../../log/log');
const EventEmitter =require('events').EventEmitter;

class DHIPC extends IPC{
    constructor(options){
        super(options);
        _.each({
            "zoom_speed":config['zoomSpeed'],"focus_speed":config['focusSpeed'],
            "aperture_speed":config['apertureSpeed'],"h_speed":config['hSpeed'],
            "v_speed":config['vSpeed']
        },(val,key)=>{this[key]=key in options?options[key]:val;});
        _.each({"ptz":false,"audio":false,"alarm":false},(val,key)=>{
            this.options[key]=!!_.get(options,`functions.${key}`,val);
        });
        _.each({'ip':'','port':0,'user':'','pwd':'',
            'b3g_protocol':false
        },(val,key)=>{this.options[key]=key in options?options[key]:val;});
        this._loginID=0;
        this._playID=0;
        this._talkID=0;
        this._channel=0;
        this._stopCmd=null;
        this.onvif=null;
        if(options.onvif)this.onvif=new Onvif(_.extend({},options,options.onvif));
        this._disConnectFn=this._onDisConnected.bind(this);
        this._reConnectFn=this._onReConnected.bind(this);
        this._vedioBuffer=null;
        Parser(this,'dh_ipc.js',{id:this.options.id,ip:this.options.ip,port:this.options.port});
        //this._keepAlive=0;
    }

    getRtspUriWithAuth() {
        if(this.onvif) return this.onvif.getRtspUriWithAuth();
        return Promise.reject();
    }

    get supportPTZ(){return this.options.ptz;}
    get supportAudio(){return this.options.audio;}
    get supportAlarm(){return this.options.alarm;}

    _error(desc){
        let code=desc?DHIPC.lastError:0;
        let err={code:code};
        return this.error(desc||'具体错误请参照DhNetSdk.Client_GetLastError',err);
    }

    static get lastError(){
        return dhlib.functions.CLIENT_GetLastError()&(0x7fffffff);
    }

    _getAbility(){
        assert.ok(this._loginID);
        let st=dhlib.structs.DH_DEV_ENABLE_INFO;
        let DH_DEV_ENABLE_INFO=new st();
        let nLenRet=ref.alloc('int');
        let ok=dhlib.functions.CLIENT_QuerySystemInfo(this._loginID,dhlib.enums.DH_SYS_ABILITY.DEVALL_INFO,DH_DEV_ENABLE_INFO.ref(),st.size,nLenRet,1000);
        if(!ok){
            return null;
            //console.error(dhlib.functions.CLIENT_GetLastError() & (0x7fffffff));
        }
        let ab=DH_DEV_ENABLE_INFO.toObject();
        return{
            fn_ptz:ab.IsFucEnable[dhlib.enums.DH_DEV_ENABLE.HIDE_FUNCTION]===0,
            json:ab.IsFucEnable[dhlib.enums.DH_DEV_ENABLE.JSON_CONFIG]!==0,
        };
    }

    async  _connect() {
        if(!dhok) {
            let error=this.error('大华SDK初始化异常');
            //this.emit(IPC.Events.Error,error);
            return await Promise.reject(error);
        }
            //let x=timeSpan.start('打开连接');
        const loginType=dhlib.enums.loginType.TCP;
        let NET_DEVICEINFO_Ex=new dhlib.structs.NET_DEVICEINFO_Ex();
        let err=ref.alloc('int');
        this._loginID=dhlib.functions.CLIENT_LoginEx2(this.options.ip,this.options.port,this.options.user,this.options.pwd,loginType,ref.NULL,NET_DEVICEINFO_Ex.ref(),err)
        //err=err.deref();
        if(!this._loginID){
            let error=this._error('设备登入错误');
            //this.emit(IPC.Events.Error,error);
            return await Promise.reject(error);
        }
        if(false){
            let ab=this._getAbility();
            this.options.fn_ptz=ab.fn_ptz||false;
            this.options.b3g_protocol=ab.json||NET_DEVICEINFO_Ex.toObject().nChanNum>32||false;
        }
        this.setConnected();
        this.emit(IPC.Events.Connected,this.log('设备已连接'));
    }
    async _disConnect() {
        if(!this._loginID)return await Promise.resolve();
        let dis=async ()=>{
            if(dhlib.functions.CLIENT_Logout(this._loginID)){
                this._loginID=0;
                this.emit(IPC.Events.DisConnected,this.log('设备已断开连接'));
                return;
            }
            return await Promise.reject(this._error('大华设备登出错误'));
        };
        await Promise.all([this.stopRealPlay(),this.stopTalk()]).then(dis).catch(dis);
    }

/*    _transform(buf,enc,next){
        next(null,buf);
    }*/

    get inPlay(){return !!this._playID;}

    _pushData(buf,cb){
        //console.log(buf.toString('hex'));

        if(this._vedioBuffer){
            buf=Buffer.concat([this._vedioBuffer,buf]);
        }

        const startWithDHAV=buf.slice(0,4).indexOf(DHAV)===0,
            endWithdhav=buf.slice(-8).indexOf(dhav)===0;

        let slice=function (buf) {
            if(buf.slice(0,4).indexOf(h264Prefix)===0){
                let index,indexPre=0;
                while((index=buf.indexOf(h264Prefix,indexPre+4))!==-1){
                    cb(buf.slice(indexPre,index));
                    buf=buf.slice(index);
                }
                cb(buf);
            }
            else if(buf[0]===aacPrefix[0]&&(buf[1]&0xf0)===0xf0){
                cb(buf);
            }
        };
        if(startWithDHAV&&endWithdhav){
            if(buf[5]===0xf1) {
                return;
            }
            buf=buf.slice(40,-8);
            slice(buf);
            if(this._vedioBuffer){
                this._vedioBuffer=null;
            }
        }
        else{
            this._vedioBuffer=Buffer.from(buf);
        }

    }

    //有音频设置时同样会返回音频数据
    async _realPlay() {
        await this.connect();
        this._playID=dhlib.functions.CLIENT_RealPlayEx(this._loginID,this._channel,ref.NULL,dhlib.enums.playType.Realplay_1);
        if(!this._playID){
            let error=this._error('获取设备的播放句柄错误');
            this.emit(IPC.Events.Error,error);
            return await Promise.reject(error);
        }
        //let id=this.options.id;
        let cb=this._playcb=dhlib.callbacks.fRealDataCallBackEx((rid,dataType,data,size/*,param,dwuser*/)=>{
            let buf=dhlib.utils.readBuffer(data,size);
            //console.log(buf.slice(4,5).toString('hex')+'\r');
            //if(buf[4]===0xfd) console.log(buf.toString('utf8')+'\r');
            this._pushData(buf,(data)=>{
                EventEmitter.prototype.emit.call(this,'video',data);
            });
        });
        if(!dhlib.functions.CLIENT_SetRealDataCallBackEx(this._playID,cb,0,1)){
            delete this._playcb;
            let error=this._error('直播数据回调函数绑定异常');
            //this.emit(IPC.Events.Error,error);
            return await Promise.reject(error);
        }
        this.setPlaying();
        this.emit(IPC.Events.RealPlay,this.log('直播端口已打开'));
    }

    async _stopRealPlay() {
        if(!this._playID) return;
        if(dhlib.functions.CLIENT_StopRealPlayEx(this._playID)){
            this.emit(IPC.Events.StopRealPlay,this.log('直播端口关闭'));
        }
        else{
            this._error('直播端口关闭异常')
            //this.emit(IPC.Events.Error,this._error('直播端口关闭异常'));
        }
        this._playID=0;
        delete this._playcb;
        await this.disConnect();
    }

    async _startTalk(){
        await this.connect();
        /*let type =*/await this._talkInit();
        //如果在播放中就不通过talk拉取音频了，视频中已经取回了音频，这里再取会出问题
        let cb=this._talkcb=dhlib.callbacks.pfAudioDataCallBack(this.isPlaying?()=>{}:(tid,data,size/*,remotedwuser*/)=>{
            let buf=dhlib.utils.readBuffer(data,size);
            this._pushData(buf,(data)=>{
                EventEmitter.prototype.emit.call(this,'audio',data);
            });
        });
        this._talkID=dhlib.functions.CLIENT_StartTalkEx(this._loginID,cb,0);
        if(!this._talkID) {
            delete this._talkcb;
            //_this.options.fn_audio=false;
            return await Promise.reject(this._error('startTalk'));
        }
/*      if(!isLinux){
            if(!dhlib.functions.CLIENT_RecordStartEx(_this._talkID)){
                return reject(this._error('recordStartEx'));

            }
        }*/
        this.emit(IPC.Events.AudioPlay,this.log('音频对讲端口打开'));
        this.setTalking();
    }

    async _getAudioEncodeType(){
        if(this._audio_config) return this._audio_config;
        if(!this._loginID) return await Promise.reject('请先连接设备');
        let lst=new dhlib.structs.TALKFORMAT_LIST();
        let nLenRet=ref.alloc('int');
        let ok=dhlib.functions.CLIENT_QueryDevState(this._loginID,dhlib.consts.DEVSTATE_TALK_ECTYPE,lst.ref(),dhlib.structs.TALKFORMAT_LIST.size,nLenRet,1000);
        if(!ok/*nLenRet.deref()!==dhlib.structs.TALKFORMAT_LIST.size*/){
            let error=this._error('无法查找到设备支持的音频编码格式');
            this.emit(IPC.Events.Error,error);
            return await Promise.reject(error);
        }
        for(let i=0;i<lst.nSupportNum;i++){
            let lsti=lst.type[i];
            if(lsti.encodeType===dhlib.enums.TALK_CODING_TYPE.AAC.value/*||lsti.encodeType===dhlib.enums.TALK_CODING_TYPE.mp3*/){
                return resolve(this._audio_config={
                    dwSampleRate:lsti.dwSampleRate,
                    encodeType:lsti.encodeType,
                    nAudioBit:lsti.nAudioBit
                });
            }
        }
        let error=this._error('设备不支持AAC音频编码');
        //this.emit(IPC.Events.Error,error);
        return await Promise.reject(error);
    }

    async _talkInit()
    {
        let type=await this._getAudioEncodeType();
        let ok=dhlib.functions.CLIENT_SetDeviceMode(this._loginID,dhlib.enums.EM_USEDEV_MODE.TALK_SERVER_MODE,ref.NULL);
        if(!ok){
            let error=this._error('设置音频为服务端模式错误');
            //this.emit(IPC.Events.Error,error);
            return await Promise.reject(error);
        }
        let en=dhlib.structs.TALKDECODE_INFO({
            encodeType:type.encodeType,
            nAudioBit:type.nAudioBit,
            dwSampleRate:type.dwSampleRate,
            nPacketPeriod:25
        });

        ok=dhlib.functions.CLIENT_SetDeviceMode(this._loginID,dhlib.enums.EM_USEDEV_MODE.TALK_ENCODE_TYPE,en.ref());
        if(!ok){
            let error=this._error('设置音频格式错误');
            //this.emit(IPC.Events.Error,error);
            return await Promise.reject(error);
        }
        let sp=new dhlib.structs.NET_SPEAK_PARAM({
            dwSize:dhlib.structs.NET_SPEAK_PARAM.size,
            nMode:0,
            nSpeakerChannel:0,
            bEnableWait:0
        });
        ok=dhlib.functions.CLIENT_SetDeviceMode(this._loginID,dhlib.enums.EM_USEDEV_MODE.TALK_SPEAK_PARAM,sp.ref());
        if(!ok){
            let error=this._error('设置音频模式错误');
            //this.emit(IPC.Events.Error,error);
            return await Promise.reject(error);
        }
        let ttp=new dhlib.structs.NET_TALK_TRANSFER_PARAM({
            dwSize:dhlib.structs.NET_TALK_TRANSFER_PARAM.size,
            bTransfer:0
        });
        ok=dhlib.functions.CLIENT_SetDeviceMode(this._loginID,dhlib.enums.EM_USEDEV_MODE.TALK_TRANSFER_MODE,ttp.ref());
        if(!ok){
            let error=this._error('设置音频传输方式错误');
            //this.emit(IPC.Events.Error,error);
            return await Promise.reject(error);
        }
        return type;
    }

    async _stopTalk(){
        if(this._talkcb) delete this._talkcb;
        if(!this._talkID) return;
        if(1===dhlib.functions.CLIENT_StopTalkEx(this._talkID)){
            this.emit(IPC.Events.AudioStopPlay,this.log('音频对讲端口关闭'));
        }
        else{
            /*let error=*/this._error('停止对讲发生错误')
            //this.emit(IPC.Events.Error,error);
        }
        await this.disConnect();
    }

    async setTalkData(data,size){
        if(!this._talkID) return await Promise.reject(this._error('需要先打开通道',false));
        if(size===dhlib.functions.CLIENT_TalkSendData(this._talkID,data,size)){
            return;
        }
        let error=this._error('向音频数据发送异常');
        //this.emit(IPC.Events.Error,error);
        return await Promise.reject(error);
    }

    _onDisConnected(loginID/*,string,port,dwuser*/){
        if(this._loginID!==loginID){
            return;
        }
        clearInterval(this._onlineInterval||0);
        this._offileInterval=setInterval(()=>{
            this.emit(IPC.Events.Offline,this.warn('连接被动断开超过6秒，请查看设备或网络情况'));
        },6000);
    }

    _onReConnected(loginid/*,string,port,dwuser*/){
        if(this._loginID!==loginid){
            return;
        }
        clearInterval(this._offileInterval||0);
        this._offileInterval=0;
        this.emit(IPC.Events.Online);
    }

    _listen(){
        this.connect().then(()=>{
            dhlib.on('disconnect',this._disConnectFn);
            dhlib.on('reconnected',this._reConnectFn);
            this.emit(IPC.Events.Online);
        }).catch((e)=>{
            this.emit(IPC.Events.Offline,{innerError:e});
        });
    }

    _stopListen(){
        //this._keepAlive&=0xd;
        dhlib.removeListener('disconnect',this._disConnectFn);
        dhlib.removeListener('reconnected',this._reConnectFn);
    }

    async _PTZ(cmdCode,p1,p2,p3=0,param4=null,stop=false){
        if(!this.supportPTZ) return await Promise.reject(this._error('_PTZ','设备不支持PTZ操作'));
        await this.connect();
        let cmd=_.bind(dhlib.functions.CLIENT_DHPTZControlEx2,null,_,_,cmdCode.valueOf(),p1,p2,p3,_,(param4?param4.ref():ref.NULL));
        if(cmd(this._loginID,this._channel,false)){
            this.log(`成功执行PTZ操作,操作：${cmdCode.toString()}`);
            if(!stop) this._stopCmd = cmd;
            else {
                this._stopCmd=null;
                return new Promise((resolve,reject)=>{
                    setTimeout(()=>{
                        cmd(this._loginID,this._channel,true);
                        this.disConnect().then(resolve).catch(reject);
                    },10);
                });
            }
            //return;
        }
        else{
            /*let error=*/this._error('ptz操作错误');
            //this.emit(IPC.Events.Error,error);
            //return await Promise.reject(error);

        }
        await this.disConnect();

    }


    async ptzStop(){
        if(this._stopCmd===null){
            return;
        }
        let cmd=this._stopCmd;
        this._stopCmd=null;
        await this.connect();
        let ok=cmd(this._loginID,this._channel,false)&&cmd(this._loginID,this._channel,true);
        await this.disConnect();
        if(ok){
            return this.log('成功执行PTZ停止操作');
        }
        let error=this._error('停止ptz操作错误');
        //this.emit(IPC.Events.Error,error);
        return await Promise.reject(error);
    }

    async zoomAdd(stop) {
        return await this._PTZ(dhlib.enums.PTZ.PTZ_ZOOM_ADD,0,this.zoom_speed,0,null,stop);
    }

    async zoomDec(stop) {
        return await this._PTZ(dhlib.enums.PTZ.PTZ_ZOOM_DEC,0,this.zoom_speed,0,null,stop);
    }

    async focusAdd(stop) {
        return await this._PTZ(dhlib.enums.PTZ.PTZ_FOCUS_ADD,0,this.focus_speed,0,null,stop);
    }

    async focusDec(stop) {
        return await this._PTZ(dhlib.enums.PTZ.PTZ_FOCUS_DEC,0,this.focus_speed,0,null,stop);
    }

    async apertureAdd(stop){
        return await this._PTZ(dhlib.enums.PTZ.PTZ_APERTURE_ADD,0,this.aperture_speed,0,null,stop);
    }

    async apertureDec(stop) {
        return await this._PTZ(dhlib.enums.PTZ.PTZ_APERTURE_DEC,0,this.aperture_speed,0,null,stop);
    }

    async move(direction,stop){
        if(!this.supportPTZ) {
            let error =this._error('设备不支持PTZ操作');
            //this.emit(IPC.Events.Error,error);
            return await Promise.reject(error);
        }
        const _d=IPC.Directions;
        switch(direction){
            case _d.top:
                direction=dhlib.enums.PTZ.PTZ_UP;break;
            case _d.left:
                direction=dhlib.enums.PTZ.PTZ_LEFT;break;
            case _d.right:
                direction=dhlib.enums.PTZ.PTZ_RIGHT;break;
            case _d.down:
                direction=dhlib.enums.PTZ.PTZ_DOWN;break;
            case _d.lefttop:
                direction=dhlib.enums.PTZ.EXTPTZ_LEFTTOP;break;
            case _d.leftdown:
                direction=dhlib.enums.PTZ.EXTPTZ_RIGHTDOWN;break;
            case _d.righttop:
                direction=dhlib.enums.PTZ.EXTPTZ_RIGHTTOP;break;
            case _d.rightdown:
                direction=dhlib.enums.PTZ.EXTPTZ_RIGHTDOWN;break;
            default:{
                assert.ok(false);
                direction=-1;break;
            }
        }
        return await this._PTZ(direction,this.v_speed,this.h_speed,0,null,stop);
    }

    async moveToPoint(x,y,z){
        let pos=new dhlib.structs.PTZ_CONTROL_ABSOLUTELY({
            stuPosition:new dhlib.structs.PTZ_SPACE_UNIT({nPositionX:x,nPositionY:y,nZoom:z}),
            stuSpeed:new dhlib.structs.PTZ_SPEED_UNIT({fPositionX:1.0,fPositionY:1.0,fZoom:1.0})
        });
        return await this._PTZ(dhlib.enums.PTZ.EXTPTZ_MOVE_ABSOLUTELY,0,0,0,pos);
    }

    async moveToPreset(pt){
        if(!this.supportPTZ) {
            let error =this._error('设备不支持PTZ操作');
            //this.emit(IPC.Events.Error,error);
            return await Promise.reject(error);
        }
        if(pt.preset){
            return await this._PTZ(dhlib.enums.PTZ.PTZ_POINT_MOVE,0,pt.preset,0);
        }
        else{
            return await this.moveToPoint(pt.x,pt.y,pt.z);
        }
    }
/*暂时不启用
    //标记当前位置未新的预置点，标题如示，删除预置点通过返回的参数对象进行操作
    async setPreset(caption){
        throw new Error('未实现函数setPreset');
        if(!this.supportPTZ) {
            let error =this._error('设备不支持PTZ操作');
            //this.emit(IPC.Events.Error,error);
            return await Promise.reject(error);
        }
        //判断名字是否已经存在，则加入对应的点,同一个位置不同的名称可以重复加入
        assert.ok(!this.existsPreset(caption));
        //let nameBuffer=dhlib.utils.utf82Mbcs(name);
        return Promise.all([this.getPoint(),this._getNextPresets()]).then((values)=>{
           return this._PTZ(dhlib.enums.PTZ.PTZ_POINT_SET,0,values[1]).then(()=>{
                    //{x,y,z,preset,name}
                let ret=_.extend(values[0],{preset:values[1]});
                //IPC.prototype.setPreset.call(this,name,ret);
                super.setPreset(caption,ret);
                return Promise.resolve(ret);
           });
        });
    }

    async removePreset(preset){
        throw new Error('未实现函数removePreset');
    }

    //获取下一个预置点的编号，大华通过编号移动预置点，标题在移动时在画面上显示
    async _getNextPresets(){
        let lst=await this._getPresets();
        let ret=lst.length+1;
        for(let i=0;i<lst.length;i++){
            if(lst[i].nIndex!==i+1){
                ret=i+1;
            }
        }
        return ret;
    }

    //获取所有的预置点信息
    async _getPresets(){
        //BYTE 个预置点最多
        await this.connect();
        let PresetType=ArrayType(dhlib.structs.NET_PTZ_PRESET);
        let plst=new PresetType(255);
        let lst=new dhlib.structs.NET_PTZ_PRESET_LIST({
            'dwSize':dhlib.structs.NET_PTZ_PRESET_LIST.size,
            'dwMaxPresetNum':255,//1~255
            'dwRetPresetNum':255,
            'pstuPtzPorsetList':plst.buffer
        });
        let nLenRet=ref.alloc('int');
        let bok=dhlib.functions.CLIENT_QueryDevState(
            this._loginID,
            dhlib.consts.DH_DEVSTATE_PTZ_PRESET_LIST,
            lst.ref(),
            dhlib.structs.NET_PTZ_PRESET_LIST.size,
            nLenRet,
            1000
        );
        await this.disConnect();
        if(!bok){
            let error =this._error('获取预置点列表发生错误');
            //this.emit(IPC.Events.Error,error);

            return await Promise.reject(error);
        }
        let presets=[];
        for(let i=0;i<lst.dwRetPresetNum;i++){
            presets.push({
                'nIndex':plst[i].nIndex,
                'szName':dhlib.utils.mbcs2Utf8(plst[i].szName.buffer)
            });
        }
        return _.sortBy(presets,['nIndex']);
    }
*/
    //获得当前球机坐标xyz
    async getPoint(){
        if(!this.supportPTZ) {
            let error =this._error('设备不支持PTZ操作');
            //this.emit(IPC.Events.Error,error);
            return await Promise.reject(error);
        }
        await this.connect();
        let nLenRet=ref.alloc('int');
        let location=dhlib.structs.DH_PTZ_LOCATION_INFO();
        let bok=dhlib.functions.CLIENT_QueryDevState(
            this._loginID,
            dhlib.consts.DH_DEVSTATE_PTZ_LOCATION,
            location.ref(),
            dhlib.structs.DH_PTZ_LOCATION_INFO.size,
            nLenRet,
            1000
        );
        await this.disConnect();
        if(!bok){
            let error =this._error('获取球机为止发生错误');
            //this.emit(IPC.Events.Error,error);
            return await Promise.reject(error);
        }
        assert.ok(nLenRet.deref()===dhlib.structs.DH_PTZ_LOCATION_INFO.size);
        return {
            x:location.nPTZPan,
            y :location.nPTZTilt,
            z :location.nPTZZoom
        };
    }

    async _alarm(open){
        if(!this.supportAlarm){
            let error =this._error('设备不支持报警输出');
            //this.emit(IPC.Events.Error,error);
            return await Promise.reject(error);
        }
        await this.connect();
        let ALARMCTRL_PARAM = dhlib.structs.ALARMCTRL_PARAM;
        let ap = new ALARMCTRL_PARAM({
            dwSize: ALARMCTRL_PARAM.size,
            nAlarmNo: 0,
            nAction: (open ? 1:0)
        });
        //dhlib.enums.CTRL_TYPE.TRIGGER_ALARM_OUT
        let ok=dhlib.functions.CLIENT_ControlDevice(this._loginID,101,ap.ref(), 1000);
        await this.disConnect();
        if (ok!==0) {
            this.emit(open?IPC.Events.Alarm:IPC.Events.AlarmStop,this.log(`报警输出已${open?'打开':'关闭'}`));
            return;
        }
        this.options.fn_alarm=false;
        let error =this._error('报警指令未发出');
        //this.emit(IPC.Events.Error,error);
        return await Promise.reject(error);
    }

    async alarm(){
        return await this._alarm(true);
    }
    async stopAlarm(){
        return await this._alarm(false);
    }

    async setVolume(pt){
        if(!this._playID){
            let error =this._error('打开视频端口后使用');
            //this.emit(IPC.Events.Error,error);
            return await Promise.reject(error);
        }
        if(dhlib.functions.CLIENT_SetVolume(this._playID,pt)){
            return;
        }
        let error =this._error('设置音量异常');
        //this.emit(IPC.Events.Error,error);
        return await Promise.reject(error);
    }



    static async discovery(cb,timeout=10000){
        let callback=dhlib.callbacks.fSearchDevicesCB((data/*,userData*/)=>{
            let buf=dhlib.utils.readBuffer(data,dhlib.structs.DEVICE_NET_INFO_EX.size);
            let dataClone=Buffer.from(buf);
            let ipcData=new dhlib.structs.DEVICE_NET_INFO_EX(dataClone);
            let ipcInfo=dhlib.utils.structParser(dhlib.structs.DEVICE_NET_INFO_EX,ipcData);
            if(ipcInfo.szDetailType.indexOf("IPC")!==0) return;
            if(ipcInfo.iIPVersion-0!==4)return;
            cb({ip:ipcInfo.szIP,port:ipcInfo.nPort});
        });
        let handle=dhlib.functions.CLIENT_StartSearchDevices(callback,ref.NULL,ref.NULL);
        return new Promise((resolve,reject)=>{
            if(0===handle) return reject(`启用搜索异常，内部错误码：${DHIPC.lastError}`);
            setTimeout(()=>{
                dhlib.functions.CLIENT_StopSearchDevices(handle);
                cb(null);
                resolve();
            },timeout||10000);
        });
    }
}

exports=module.exports=DHIPC;

/*
iIPVersion:4
szIP:192.168.1.92
nPort:37777
szSubmask:255.255.255.0
szGateway:192.168.1.1
szMac:4c:11:bf:a9:41:a9
szDeviceType:IPC-HDW4125C
byManuFactory:0
byDefinition:0
bDhcpEn:false
byReserved1:0
verifyData:
szSerialNo:1E00400PAX01524
szDevSoftVersion:
szDetailType:IPC-HDW4125C
szVendor:
szDevName:
szUserName:
szPassWord:
nHttpPort:80
wVideoInputCh:0
wRemoteVideoInputCh:0
wVideoOutputCh:0
wAlarmInputCh:0
wAlarmOutputCh:0
cReserved:

iIPVersion:4
szIP:192.168.1.100
nPort:37777
szSubmask:255.255.255.0
szGateway:192.168.1.1
szMac:4c:11:bf:01:cf:dc
szDeviceType:NVR
byManuFactory:0
byDefinition:0
bDhcpEn:false
byReserved1:0
verifyData:2302
szSerialNo:PZA4MM155WCEO4N
szDevSoftVersion:
szDetailType:NVR
szVendor:
szDevName:
szUserName:
szPassWord:
nHttpPort:80
wVideoInputCh:0
wRemoteVideoInputCh:0
wVideoOutputCh:0
wAlarmInputCh:0
wAlarmOutputCh:0
cReserved:
 */