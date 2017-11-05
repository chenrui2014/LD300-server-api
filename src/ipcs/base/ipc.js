/**
 * Created by Luky on 2017/7/1.
 */

const PTZ=require('./ptz');
const _=require('lodash');
const config=global.server_config||require('../../config/config');
const ptzLock=_.get(config,'ipc.ptzLock',15000);
const url=require('url');
const assert=require('assert');

const _q={
    'smooth':0,
    'clear':1,
    'hd':2
};

/*const _s={
    'idel':0,
    'call':1
};*/
/*
const _runWay={
    'pull':0,
    'push':1,
    'cache':2
};*/

const _events={
    'Connected':'connected',
    'DisConnected':'disConnected',
    'RealPlay':'realPlay',
    'StopRealPlay':'stopRealPlay',
    'AudioPlay':'audioPlay',
    'AudioStopPlay':'audioStopPlay',
    'Alarm':'alarm',
    'AlarmStop':'alarmStop',
    'Online':'online',
    'Offline':'offline',
    'Error':'error'
};

class IPC extends PTZ{
    constructor(options){
        super(/*{ objectMode: true }*/options);
        _.each({'id':0,'brand':''},(val,key)=>{this.options[key]=key in options?options[key]:val;});
        _.each({
           'quality':_q.smooth
        },(val,key)=>{this[key]=key in options?options[key]:val;});
/*        this._state=_s.idel;*/
        this.on('newListener', this._newListener.bind(this));
        this.on('removeListener', this._removeListener.bind(this));
        /*this._runWay=config.runWay;
         if(config.runWay!==_runWay.pull){
         }*/
    }

    get id(){
        return this.options.id;
    }

    static get Events(){
        return _events;
    }

    _newListener(event) {
        if(this.listenerCount(event)!== 0) return;
        if (event === _events.Alive) {
            this._listen();
        }
    }

    _removeListener(event) {
        if(this.listenerCount(event)!== 0) return;
        if (event ===_events.Offline) {
            this._stopListen();
        }
    }

    static get Directions(){
        return PTZ.Directions;
    }
    static get quality(){
        return _q;
    }
    get supportPTZ(){return false;}
    get supportAudio(){return false;}
    get supportAlarm(){return false;}
    get config(){return PTZ.prototype.config.call(this);}
    get isConnected(){return PTZ.prototype.isConnected.call(this);}
    connect(){return PTZ.prototype.connect.call(this);}
    disConnect(){return PTZ.prototype.disConnect.call(this);}
    //全部从辅码1流中获取，如果需要高精度请对应设置设备参数
    realPlay() {throw new Error('未实现函数realPlay');}
    stopRealPlay() {throw new Error('未实现函数stopRealPlay');}
    //要求promise自己catch掉，视频可用的情况下要启用视频
    //这两个端口暂时不使用,用于打开独立的音频输入输出
    startTalk(){throw new Error('未实现函数_startTalk');}
    stopTalk(){throw new Error('未实现函数_stopTalk');}
    setTalkData(data,size){throw new Error('未实现函数setTalkData');}
    setVolume(pt){throw new Error('未实现函数setVolume');}
    _listen(){throw new Error('未实现函数listen');}
    _stopListen(){throw new Error('未实现函数stopListen');}
    alarm(){throw new Error('未实现函数alarm');}
    stopAlarm(){throw new Error('未实现函数stopAlarm');}
}
exports=module.exports=IPC;