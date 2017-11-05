/**
 * Created by Luky on 2017/7/5.
 */

const assert=require('assert');
const _=require('lodash');
const util = require('util');

function allocIPC(IPC,optionsIPC,ptz,optionsPTZ/*,audio,optionsAudio*/) {
    class IPCIntegration extends IPC{
        constructor(){
            super(optionsIPC);
            if(ptz){
                this._ptzHandle=new ptz(optionsPTZ);
            }
/*          if(audio){
                    this._audioHandle=new audio(optionsAudio);
            }*/
            this._connected=false;
        }

        get supportPTZ(){
            return null!==this._ptzHandle&&this._ptzHandle.supportPTZ;
        }

        get supportAudio(){
            return  false;
            //return null!==this._audioHandle&&this._audioHandle.supportAudio;
        }

        zoomIn() {
            if(!this.supportPTZ)return Promise.resolve();
            return this._ptzHandle.zoomIn();
        }
        zoomOut() {
            if(!this.supportPTZ)return Promise.resolve();
            return this._ptzHandle.zoomOut();
        }
        focusIn() {
            if(!this.supportPTZ)return Promise.resolve();
            return this._ptzHandle.focusIn();
        }
        focusOut() {
            if(!this.supportPTZ)return Promise.resolve();
            return this._ptzHandle.focusOut();
        }
        apertureIn() {
            if(!this.supportPTZ)return Promise.resolve();
            return this._ptzHandle.apertureIn();
        }
        apertureOut() {
            if(!this.supportPTZ)return Promise.resolve();
            return this._ptzHandle.apertureOut();
        }
        move(direction){
            if(!this.supportPTZ)return Promise.resolve();
            return this._ptzHandle.move(direction);
        }
        ptzStop(){
            if(!this.supportPTZ)return Promise.resolve();
            return this._ptzHandle.ptzStop();
        }
        moveToPreset(preset){
            if(!this.supportPTZ)return Promise.resolve();
            return this._ptzHandle.moveToPreset(preset);
        }
        moveToPoint(pt){
            if(!this.supportPTZ)return Promise.resolve();
            return this._ptzHandle.moveToPoint(pt);
        }
        setPoint(index){
            if(!this.supportPTZ)return Promise.resolve();
            return this._ptzHandle.setPoint(index);
        }
        getPoints(){
            if(!this.supportPTZ)return Promise.resolve();
            return this._ptzHandle.getPoints();
        }
        getPonintXYZ(){
            if(!this.supportPTZ)return Promise.resolve();
            return this._ptzHandle.getPonintXYZ();
        }
        removePoint(index){
            if(!this.supportPTZ)return Promise.resolve();
            return this._ptzHandle.removePoint(index);
        }

        setTalkData(data,size){
            if(!this.supportAudio)return Promise.resolve();
            return this._audioHandle.setTalkData(data,size);
        }

        setVolume(pt){
            if(!this.supportAudio)return Promise.resolve();
            return this._audioHandle.setVolume(pt);
        }

    }
    return new IPCIntegration();
}

exports=module.exports=allocIPC;