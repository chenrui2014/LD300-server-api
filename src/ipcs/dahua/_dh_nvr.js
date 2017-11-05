/**
 * Created by Luky on 2017/7/1.
 */
const PTZ=require('../base/ptz');
const DHIPC=require('./dh_ipc');
const _=require('lodash');
const dhok=require('./dh_init');
const dhlib=require('./dhnetsdk');
const ref=require('ref');

//CLIENT_SearchDevices
//CLIENT_SearchDevicesByIPs
//查询局域网设备

class DHNVR extends DHIPC{
    constructor(options){
        super(options);
        this.brand='';
        this.video_protocol='onvif';
        this.ptz_protocol="config";
        this.audio_protocol="dahua";
        this._channel=this.nvr_channel;
    }

    _PTZ(callback,cmd,p1){

        if(!this._loginID){
            if(callback)process.nextTick(()=>{
                callback('connect first');
            });
            return;
        }
        callback=callback||function(){};
        process.nextTick(()=>{
            if(dhlib.functions.CLIENT_PTZControl(this._loginID,this.nvr_channel,cmd,p1,0)){
                this.__lastCmd=_.bind(dhlib.functions.CLIENT_PTZControl,null,this._loginID,this.nvr_channel,cmd,p1,1);
                callback();return;
            }
            this.logError(this.id,'ptz',callback);
        });
    }

    zoomIn(callback) {
        this._PTZ(callback,dhlib.enums.PTZ.PTZ_ZOOM_ADD,this.zoom_speed);
    }
    zoomOut(callback) {
        this._PTZ(callback,dhlib.enums.PTZ.PTZ_ZOOM_DEC,this.zoom_speed);
    }
    focusIn(callback) {
        this._PTZ(callback,dhlib.enums.PTZ.PTZ_FOCUS_ADD,this.focus_speed);
    }
    focusOut(callback) {
        this._PTZ(callback,dhlib.enums.PTZ.PTZ_FOCUS_DEC,this.focus_speed);
    }
    apertureIn(callback) {
        this._PTZ(callback,dhlib.enums.PTZ.PTZ_APERTURE_ADD,this.aperture_speed);
    }
    apertureOut(callback) {
        this._PTZ(callback,dhlib.enums.PTZ.PTZ_APERTURE_DEC,this.aperture_speed);
    }
    move(direction,callback){
        if(!this.isDemo){
            if(callback)process.nextTick(()=> {
                callback('not a demo');
            });
            return;
        }
        let _d=PTZ.Directions;
        switch(direction) {
            case _d.top:
                direction = dhlib.enums.PTZ.PTZ_UP;
                break;
            case _d.left:
                direction = dhlib.enums.PTZ.PTZ_LEFT;
                break;
            case _d.right:
                direction = dhlib.enums.PTZ.PTZ_RIGHT;
                break;
            case _d.down:
                direction = dhlib.enums.PTZ.PTZ_DOWN;
                break;
            default:{
                if(callback)process.nextTick(()=>{
                    callback('cmd unsupport');
                });
                return;
            }
        }
        if(direction===dhlib.enums.PTZ.PTZ_UP||direction===dhlib.enums.PTZ.PTZ_DOWN){
            this._PTZ(callback,this._loginID,this.nvr_channel,direction,this.v_speed);
            return;
        }
        this._PTZ(callback,this._loginID,this.nvr_channel,direction,this.h_speed);
    }
    moveToPoint(pt,cb){
        if(!this.isDemo){
            if(callback)process.nextTick(()=> {
                callback('not a demo');
            });
            return;
        }
        this._PTZ(cb,dhlib.enums.PTZ.PTZ_POINT_MOVE,pt,0);
    }
    setPoint(index,cb){
        if(!this.isDemo){
            if(callback)process.nextTick(()=> {
                callback('not a demo');
            });
            return;
        }
        this._PTZ(cb,dhlib,enums.PTZ.PTZ_POINT_SET,index,0);
    }
}

exports=module.exports=DHNVR;

