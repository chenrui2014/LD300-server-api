/**
 * Created by Luky on 2017/7/4.
 */
const addin=require('../ipcs/ipc_addin');
const _=require('lodash');
const Data=require('./data_server');
const {Parser}=require('../log/log');

class IPCFactory{
    constructor(){
        this._ipcs={};
        Parser(this,'ipc_factory.js');
    }

    async getIPC(id){
        let ipcStore=this._ipcs[id];
        //延迟回收，便于访问后台最新的数据
        if(ipcStore&&ipcStore.instance&&ipcStore.instance.isConnected){
            return ipcStore.instance;
        }

        let cfg=await Data.getIPC(id).catch((e)=>{
            this.error('摄像头配置数据获取失败',{id:ipc.id,innerError:e});
            if(ipcStore) return null;
            else return Promise.reject(e);
        });
        if(!cfg&&ipcStore){
            this.warn('远程数据拉取失败，使用使用本地保存实例');
            return ipcStore.instance;
        }
        let ipc=addin.createInstance(cfg);
        if(!ipc){
            await Promise.reject(this.log('获取摄像头实例化失败',{config:cfg}));
        }
        this.log('获取摄像头实例化成功',{config:cfg});
        this._ipcs[id]={instance:ipc,ref:1,last:0};
        return ipc;
        /*
        if(!options) return null;
        if(options.brand){
            assert.ok(options.brand in addin.brand);
            return this._ipcs[id]=new addin.brand[options.brand]['cls'](options);
        }
        let video_ps=addin.video_component[options.protocol];
        //音频、视频和ptz集成或者PTz、音频不支持时直接new video
        let ptz_ps=addin.ptz_component[_.get(options,'ptz.protocol',video_ps)];
        //let audio_ps=addin.audio_component[_.get(options,'audio.protocol',video_ps)];
        if(video_ps===ptz_ps/!*&&video_ps===audio_ps*!/) return this._ipcs[id]=new video_ps['cls'](options);
        return this._ipcs[id]=integration(video_ps['cls'],(ptz_ps?ptz_ps['cls']:null),null/!*(audio_ps?audio_ps['cls']:null)*!/,options);*/
    }
}

exports=module.exports=new IPCFactory();