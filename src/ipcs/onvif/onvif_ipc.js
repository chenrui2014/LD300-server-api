/**
 * Created by Luky on 2017/7/3.
 */

const PTZ=require('../base/ptz');
const IPC=require('../base/ipc');
const onvif=require('onvif');
const globalConfig=global.server_config||require('../../config/config');
const config=globalConfig.getConfig('onvif_config.json');
const Cam=onvif.Cam;
const _=require('lodash');
const assert = require('assert');
const {RtspClient,H264Transport} =require('../../../_3part/yellowstone');
const header = new Buffer.from([0x00,0x00,0x00,0x01]);
const {Parser} =require('../../log/log');

class ONVIF_IPC extends  IPC{
    constructor(options){
        super(options);
        _.each({"zoom_speed":config['zoomSpeed'],"focus_speed":config['focusSpeed'],
            "aperture_speed":config['apertureSpeed'],"h_speed":config['hSpeed'],
            "v_speed":config['vSpeed']},(val,key)=>{this[key]=options[key]||val;});
        _.each({'ip':'','port':0,'user':'','pwd':'',
            'b3g_protocol':false
        },(val,key)=>{this.options[key]=key in options?options[key]:val;});
        _.each({'ip':'','port':0,'user':'','pwd':'','path':''},(val,key)=>{this.options[key]=key in options?options[key]:val;});
        this._connected=false;
        this._camera_handle=null;
        this.__profiles=[];
        this.__profile=null;
        Parser(this,'onvif.js',{id:this.options.id});
    }

    connect(callback){
        if(this.isConnected) return Promise.resolve();
        return new Promise((resolve,reject)=>{
            let opts={
                hostname:this.options.ip,
                username:this.options.user,
                password:this.options.pwd,
                port:this.options.port
            };
            if(this.options.path) opts.path=this.options.path;
            this._camera_handle=new Cam(opts,(err)=>{
                if(err){
                    let error=this.error('ONVIF协议接入错误',{innerError:err});
                    this.emit(IPC.Events.Error,error);
                    this._camera_handle=null;
                    reject(error);
                    return;
                }
                this._connected=true;
                this.emitEvent(IPC.Events.Connected,this.log('ONVIF协议连接成功'));
                this.options.fn_ptz='PTZ' in this._camera_handle.capabilities;
                resolve();
            });
        });
    }
    get isConnected(){return this._connected;}
    disConnect(){
        if(!this._connected)return Promise.resolve();
        return new Promise((resolve)=>{
            let dis=()=>{
                delete this._camera_handle;
                this._connected=false;
                this.emitEvent(IPC.Events.DisConnected,this.log('ONVIF协议断开连接'));
                resolve();
            };
            Promise.all([this.stopRealPlay(),this.stopTalk()]).then(dis).catch(dis);
        });
    }
    get _profiles(){
        if(this.__profiles.length) return this.__profiles;
        assert.ok(this._camera_handle,'connect first');
        let ps=[];
        _.each(this._camera_handle.profiles,(prof)=>{
            if(_.toUpper(prof.videoEncoderConfiguration.encoding)!=='H264'){
                return;
            }
            let o={
                token:prof.$.token,
                fixed:prof.$.fixed,
                encodingtype:{'JPEG':3,'MPEG4':1,'H264':2}[prof.videoEncoderConfiguration.encoding],
                encoding:prof.videoEncoderConfiguration.encoding,//enum { 'JPEG', 'MPEG4', 'H264' }
                quality:prof.videoEncoderConfiguration.quality,
                width:prof.videoEncoderConfiguration.resolution.width,
                height:prof.videoEncoderConfiguration.resolution.height,
                fps:prof.videoEncoderConfiguration.rateControl.frameRateLimit,
                bitrate:prof.videoEncoderConfiguration.rateControl.bitrateLimit
            };
            ps.push(o);
        });
        ps=_.sortBy(ps,['bitrate','encodingtype']);
        return this.__profiles=ps;
    }
    get _profile(){
        assert.ok(this._camera_handle,'connect first');
        if(this.__profile) return this.__profile;
        let profs=this._profiles;
        if(profs.length===0){
            return null;
        }
        let prof;
        if(this.quality>profs.length){
            prof=_.last(profs);
        }
        else{
            prof=profs[this.quality];
        }
        return this.__profile=prof;
    }

    get bitrate(){
        //最大码率,打个9折
        //console.log(JSON.stringify(this._profile));
        //还需要加上音频的数据
        return Math.floor(this._profile.bitrate*8/10*1024/9);
    }

    getRtspUriWithAuth(){
        return this._getRtspUri().then((uri)=>{
            return respURI(uri,this.options.user,this.options.pwd);
        });
    }

    _getRtspUri(){
        if(this._rtsp_uri){
            return Promise.resolve(this._rtsp_uri);
        }
        return this.connect().then(()=> {
            return new Promise((resolve, reject) => {
                let pf = this._profile;
                if(null===pf){
                    let error=this.error('未获取H264协议相关的配置文件');
                    this.emit(IPC.Events.Error,error);
                    return reject(error);
                }
                this._camera_handle.getStreamUri({protocol: 'RTSP', profileToken: pf.token}, (err, uri)=>{
                    if (err) {
                        let error=this.error('getRtspUri','获取H264协议RTSP地址错误',{innerError:err});
                        this.emit(IPC.Events.Error,error,error);
                        return reject(error);
                    }
                    this.log('获取H264到播放地址，协议类型RTSP',{uri:uri.uri});
                    resolve(this._rtsp_uri=uri.uri);
                });
            });
        });
    }

    get inPlay(){return !!this._RtspClient;}

    _connectRtsp(url){
        if(this._RtspClient)return Promise.resolve(this._RtspClientDetail);
        const client =this._RtspClient=new RtspClient(this.options.user,this.options.pwd);
        return client.connect(url, { keepAlive: false }).then((details) => {
            //console.log('Connected. Video format is', details.format);
            // Open the output file
            //assert.ok(details.isH264);
            this._RtspClientDetail=details;
            return Promise.resolve(details);
        }).catch((err)=>{
            let error=this.error('_connectRtsp','RTSP协议直播接入异常',{innerError:err});
            this.emit(IPC.Events.Error,error,error);
            return Promise.reject(error);
        });
    }

    realPlay() {
        if(this._RtspClient) return Promise.resolve();
        return this._getRtspUri().then((uri)=>{
            return this._connectRtsp(uri).then((details)=>{
                this._h264Transport= new H264Transport(this._RtspClient,this, details);
                this._RtspClient.play();
                this._RtspClient.on('error',(err)=>{
                    this.stopRealPlay();
                    let error=this.error('RTSP协议连接发生错误',err);
                    this.emit(IPC.Events.Error,error);
                });
                this.emit(IPC.Events.RealPlay,this.log('RTSP协议直播接入'));
                return Promise.resolve();
            });
        });
    }

    _transform(data,enc,next){
        if(data.equals(header)) return next();
        let buf=Buffer.allocUnsafe(data.length+4);
        buf[0]=0;buf[1]=0;buf[2]=0;buf[3]=1;
        data.copy(buf,4);
        next(null,buf);
    }

    stopRealPlay(){
        if(!this._RtspClient) return Promise.resolve();
        return new Promise((rosolve)=>{
            this._h264Transport.unpipe(this);
            this._h264Transport=null;
            this._RtspClient.close().catch(e=>e);
            this._RtspClient=null;
            this.emit(IPC.Events.StopRealPlay,this.log('RTSP协议直播关闭'));
            rosolve();
        });
    }

    startTalk(stream){
        return Promise.resolve();
    }

    stopTalk(){
        return Promise.resolve();
    }

    _listen(/*offlinecb*/){
        let _this=this;
        let aliveState=0;//0 unknown 1 alive 2 offline
        let test=()=>{
            this._RtspClient.request("OPTIONS");
            _.throttle(emitOffline,6000);
        };

        let emitOffline=()=>{
            aliveState=2;
            _this.emit(IPC.Events.Offline);
        };

        this._heart=(data,prefix)=>{
            if(prefix==='S->C'&&data.indexOf('OPTIONS')>-1)
            {
                if(1!==aliveState)_this.emit(IPC.Events.Online);
                aliveState=1;
                setTimeout(test, 2000);
            }
        };

        this._rtspError=()=>{
            emitOffline();
        };

        return this._getRtspUri().then((uri)=> {
            return this._connectRtsp(uri).then(() => {
                setTimeout(test, 2000);
                this._RtspClient.on('log',this._heart);
                this._RtspClient.on('error',this._rtspError);
            });
        });

        /*return this._getRtspUri().then((uri)=>{
            _this._listenHandle=new HeartBeat(uri,_this.options.user,_this.options.pwd);
            _this._listenHandle.listen();
            _this._listenHandle.on(IPC.Events.Offline,(e)=>{
                _this._listenHandle=null;
                _this.emitEvent(IPC.Events.Offline,e.toString());
            });
            _this._listenHandle.on(IPC.Events.Alive,()=>{

            });
        });*/
    }

    _stopListen(){
        if(this._RtspClient)
        {
            this._RtspClient.removeListener('log',this._heart);
            this._RtspClient.removeListener('error',this._rtspError);
        }
    }

    _PTZ(options){
        let _this=this;
        if(!this.supportPTZ) return Promise.reject(this._error('_PTZ','此设备不支持PTZ操作'));
        return this.connect().then(()=>{
            return new Promise((resolve,reject)=>{
                options=_.defaults(options,{profileToken:_this._profileToken});
                this._camera_handle.relativeMove(options,(err)=>{
                    if(err){
                        let error=this.error('PTZ操作异常',{innerError:err});
                        this.emit(IPC.Events.Error,error);
                        return reject(error);
                    }
                    this.log('成功执行PTZ操作');
                    resolve();
                });
            });
        });
    }

    //getNodes
    ptzStop(callback){
        return this.connect().then(()=>{
            return new Promise((resolve,reject)=>{
                let options={panTilt:false,zoom:true,profileToken:this._profileToken};
                this._camera_handle.stop(options,(err)=>{
                    if(err){
                        let error=this.error('ptz停止异常',{innerError:error});
                        this.emit(IPC.Events.Error,error);
                        return reject();
                    }
                    this.log('成功执行PTZ操作');
                    resolve();
                });
            });
        });
    }

    zoomAdd(){
        return this._PTZ({zoom:1,speed:{zoom:config.zoomSpeed}});
    }

    zoomDec(){
        this._PTZ({zoom:-1,speed:{zoom:config.zoomSpeed}});
    }

    focusAdd() {

    }
    focusDec() {

    }
    apertureAdd() {

    }

    apertureDec() {

    }

    move(direction) {
        let x=0,y=0;
        if((direction&PTZ.Directions.top)>0){
            y=1;
        }
        if((direction&PTZ.Directions.bottom)>0){
            y=-1;
        }
        if((direction&PTZ.Directions.left)>0){
            x=-1;
        }
        if((direction&PTZ.Directions.right)>0){
            x=1;
        }

        return this._PTZ({zoom:0,x:x,y:y,speed:{x:this.h_speed,y:this.v_speed}});
    }

    moveToPoint(x,y,z){throw new Error('未实现函数moveToPoint');}

    moveToPreset(pt)
    {
        return this.connect(()=>{
            return new Promise((resolve,reject)=>{
                this._camera_handle.gotoPreset({profileToken:this._profileToken,preset:''+pt},(err)=>{
                    if(err){
                        let error=this.error('moveToPreset','移动到预置位异常',{innerError:err});
                        this.emit(IPC.Events.Error,error);
                        return reject();
                    }
                    this.log('成功执行PTZ操作');
                    resolve();
                });
            });
        });
    }

    setPreset(index)
    {

    }

    getPonintXYZ(){
        //getStatus
        /*{
            position: {
                x: 'pan position'
                    , y: 'tilt position'
                    , zoom: 'zoom'
            }
        , moveStatus: {} // camera moving
        , utcTime: 'current camera datetime'
        }*/
    }

    removePoint(index){

    }

    getPresets(){

    }

}

function respURI(uri,user,pwd){
    return uri.replace('rtsp://', `rtsp://${user}:${pwd}@`);
}

exports=module.exports=ONVIF_IPC;