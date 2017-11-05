/**
 * Created by Luky on 2017/7/5.
 */
let _=require('lodash');
let EventEmitter=require('events').EventEmitter;
let assert=require('assert');

const _d={
    'top':1,'down':2,'left':4,'right':8,
    'lefttop':5,'righttop':9,'leftdown':6,'rightdown':10
};

class PTZ extends  EventEmitter{
    constructor(){
        super();
        this.options={};
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
    get isConnected(){throw new Error('未实现函数isConnect');}
    connect(){throw new Error('未实现函数connect');}
    disConnect(){throw new Error('未实现函数disConnect');}
    zoomAdd(stop) {throw new Error('未实现函数zoomAdd');}
    zoomDec(stop) {throw new Error('未实现函数zoomDec');}
    //focusAuto() {throw new Error('未实现函数focusAuto');}
    focusAdd(stop) {throw new Error('未实现函数focusAdd');}
    focusDec(stop) {throw new Error('未实现函数focusDec');}
    //focusAuto() {throw new Error('未实现函数focusAuto');}
    apertureAdd(stop) {throw new Error('未实现函数apertureAdd');}
    apertureDec(stop) {throw new Error('未实现函数apertureDec');}
    move(direction,stop){throw new Error('未实现函数move');}
    moveToPoint(x,y,z){throw new Error('未实现函数moveToPoint');}
    ptzStop(){throw new Error('未实现函数ptzStop');}
    setPreset(caption){throw new Error('未实现函数setPreset');}
    removePreset(preset){throw new Error('未实现函数removePreset');}
    //移动到对应名称的预置点
    moveToPreset(name){throw new Error('未实现函数moveToPreset');}
    //移除对应名称的预置点
    //以下两个方法用于自动分配预置点和获取当前云台位置，各函数执行实现即可
    //getPresets(){throw new Error('未实现函数getPresets');}
    getPoint(){throw new Error('未实现函数getPoint');}
}

exports=module.exports=PTZ;