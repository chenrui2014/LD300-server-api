/**
 * Created by Luky on 2017/7/1.
 */

const PTZ=require('./ptz');
const _=require('lodash');
const config=global.server_config||require('../../config/config');
const ptzLock=_.get(config,'ipc.ptzLock',15000);
const url=require('url');
const assert=require('assert');
const Counter=require('./counter');

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
        this._realpaly_counter=new Counter();
        this._talk_counter=new Counter();
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
    setPlaying(){
        assert.ok(!this._realpaly_counter.inReference);
        this._realpaly_counter.addReference();
        this.log('更新视频播放请求数',{count:this._realpaly_counter.count});
    }
    get isPlaying(){return this._realpaly_counter.inReference;}
    async realPlay() {
        if(this.isPlaying) {
            this._realpaly_counter.addReference();
            this.log('更新视频播放请求数',{count:this._realpaly_counter.count});
            return;
        }
        await this._realPlay();
    }
    async stopRealPlay() {
        if(this._realpaly_counter.release()){
            await this._stopRealPlay();
        }
        this.log('更新视频播放请求数',{count:this._realpaly_counter.count});
    }
    //全部从辅码1流中获取，如果需要高精度请对应设置设备参数
    async _realPlay() {throw new Error('未实现函数_realPlay');}
    async _stopRealPlay() {throw new Error('未实现函数_stopRealPlay');}
    //要求promise自己catch掉，视频可用的情况下要启用视频
    //这两个端口暂时不使用,用于打开独立的音频输入输出
    setTalking(){
        assert.ok(!this._talk_counter.inReference);
        this._talk_counter.addReference();
    }
    get inTalking(){return this._talk_counter.inReference;}
    async startTalk(){
        if(this.inTalking) {
            this._talk_counter.addReference();
            return;
        }
        await this._startTalk();
    }
    async stopTalk(){
        if(this._talk_counter.release()){
            await this._stopTalk();
        }
    }
    async _startTalk(){throw new Error('未实现函数_startTalk');}
    async _stopTalk(){throw new Error('未实现函数_stopTalk');}
    async setTalkData(data,size){throw new Error('未实现函数setTalkData');}
    async setVolume(pt){throw new Error('未实现函数setVolume');}
    _listen(){throw new Error('未实现函数listen');}
    _stopListen(){throw new Error('未实现函数stopListen');}
    async alarm(){throw new Error('未实现函数alarm');}
    async stopAlarm(){throw new Error('未实现函数stopAlarm');}
}
exports=module.exports=IPC;