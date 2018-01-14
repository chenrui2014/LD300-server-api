/**
 * Created by Luky on 2017/7/5.
 */
const _=require('lodash');
const EventEmitter=require('events').EventEmitter;
const assert=require('assert');
const Counter=require('./counter');
const {Parser} =require('../../log/log');

const _d={
    'top':1,'down':2,'left':4,'right':8,
    'lefttop':5,'righttop':9,'leftdown':6,'rightdown':10
};

class PTZ extends  EventEmitter{
    constructor(){
        super();
        this.options={};
        this._conn_counter=new Counter();
        Parser(this,'ptz.js',{});
    }
    static get Directions(){
        return _d;
    }
    emit(event,params=null){
        return EventEmitter.prototype.emit.call(event,_.extend({
            type:event
        },params));
    }
    get supportPTZ(){return true;}
    get config(){return this.options;}
    setConnected(){
        assert.ok(!this._conn_counter.inReference);
        this._conn_counter.addReference();
        this.log('更新设备连接数',{count:this._conn_counter.count});
    }
    get isConnected(){return this._conn_counter.inReference}
    async connect(){
        if(this.isConnected) {
            this._conn_counter.addReference();
            this.log('更新设备连接数',{count:this._conn_counter.count});
            return;
        }
        await this._connect();
    }
    async disConnect(){
        if(this._conn_counter.release()){
          await this._disConnect();
        }
        this.log('更新设备连接数',{count:this._conn_counter.count});
    }
    async _connect(){throw new Error('未实现函数_connect');}
    async _disConnect(){throw new Error('未实现函数_disConnect');}
    async zoomAdd(stop) {throw new Error('未实现函数zoomAdd');}
    async zoomDec(stop) {throw new Error('未实现函数zoomDec');}
    //focusAuto() {throw new Error('未实现函数focusAuto');}
    async focusAdd(stop) {throw new Error('未实现函数focusAdd');}
    async focusDec(stop) {throw new Error('未实现函数focusDec');}
    //focusAuto() {throw new Error('未实现函数focusAuto');}
    async apertureAdd(stop) {throw new Error('未实现函数apertureAdd');}
    async apertureDec(stop) {throw new Error('未实现函数apertureDec');}
    async move(direction,stop){throw new Error('未实现函数move');}
    async moveToPoint(x,y,z){throw new Error('未实现函数moveToPoint');}
    async ptzStop(){throw new Error('未实现函数ptzStop');}
    //暂时不用预置点
    //async setPreset(caption){throw new Error('未实现函数setPreset');}
    //async removePreset(preset){throw new Error('未实现函数removePreset');}
    //移动到对应名称的预置点
    //async moveToPreset(name){throw new Error('未实现函数moveToPreset');}
    //移除对应名称的预置点
    //以下两个方法用于自动分配预置点和获取当前云台位置，各函数执行实现即可
    //getPresets(){throw new Error('未实现函数getPresets');}
    async getPoint(){throw new Error('未实现函数getPoint');}
}

exports=module.exports=PTZ;