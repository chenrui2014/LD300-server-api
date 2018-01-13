/**
 * Created by Luky on 2017/7/5.
 */

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

        async zoomAdd(stop) {
            if(!this.supportPTZ)return;
            return await this._ptzHandle.zoomAdd(stop);
        }
        async zoomDec(stop) {
            if(!this.supportPTZ)return;
            return await this._ptzHandle.zoomDec();
        }
        async focusAdd(stop) {
            if(!this.supportPTZ)return;
            return await this._ptzHandle.focusAdd(stop);
        }
        async focusDec(stop) {
            if(!this.supportPTZ)return;
            return this._ptzHandle.focusDec(stop);
        }
        async apertureAdd(stop) {
            if(!this.supportPTZ)return;
            return await this._ptzHandle.apertureAdd(stop);
        }
        async apertureDec() {
            if(!this.supportPTZ)return;
            return await this._ptzHandle.apertureDec(stop);
        }
        async move(direction,stop){
            if(!this.supportPTZ)return;
            return await this._ptzHandle.move(direction,stop);
        }
        async ptzStop(){
            if(!this.supportPTZ)return;
            return await this._ptzHandle.ptzStop();
        }
        async moveToPoint(pt){
            if(!this.supportPTZ)return;
            return await this._ptzHandle.moveToPoint(pt);
        }
        async getPoint(){
            if(!this.supportPTZ) return null;
            return await this._ptzHandle.getPoint();
        }
/*
        setTalkData(data,size){
            if(!this.supportAudio)return Promise.resolve();
            return this._audioHandle.setTalkData(data,size);
        }

        setVolume(pt){
            if(!this.supportAudio)return Promise.resolve();
            return this._audioHandle.setVolume(pt);
        }
        */
    }
    return new IPCIntegration();
}

exports=module.exports=allocIPC;