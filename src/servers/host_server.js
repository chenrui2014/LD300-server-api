/**
 * Created by Luky on 2017/6/23.
 */
const Host=require('../host/host');
const _ = require('lodash');
const EventEmitter = require('events').EventEmitter;
//const util = require('util');
//const assert=require('assert');
//const factory=require('./ipc_factory');
const config=global.server_config||require('../config/config');
const ipcPort=_.get(config,'ipc_server.port',3000);
const http = require('http');
const {Parser}=require('../log/log');
const IPCMointor=require('./ipc_mointors');
const runModeBS=_.get(config,'runMode.type','BS')==='BS';
const Data=require('./data_server');
//const moment = require('moment');
const path=require('path');
//const uuidv1=require('uuid/v1');

const _Errors={
    LinkFault:'linkFault',
    NoMointor:'noMointor',
    IPCServerError:'IPCServerError',
    IPCConnectError:'IPCConnectError'
};

class HostServer extends  EventEmitter{
    constructor(options,start=false){
        super();
        //this.typeClient=_.get(options,'type',_.get(config,'ipc_server.type','client'))==='client';
        //this.typeClient=false;
        this.__hosts=null;
        this._host_state_changed=this._OnHostStateChanged.bind(this);
        this._ipcServerPort=_.get(options,'ipc_server.port',ipcPort);
        Parser(this,'host_server.js');
        if(start) this.start();
    }

    _OnHostStateChanged(data){
        this._states[`hs${data.hid}`]=data;
        if(data.stateNew===Host.States.Alarm){
            this._OnIntrusionAlert(data);
        }
        else if(data.stateNew===Host.States.Normal){
            this._OnDeactivateAlert(data);
        }
        else this.emit(Host.Events.StateChanged,data);
    }

    emit(name,data){
        return EventEmitter.prototype.emit.call(this,name,_.extend({
            type:name
        },data));
    }

    _getHost(id){
        return _.find(this.__hosts,(host)=>{return host.id===id;});
    }

    _IPCRequest(path)
    {
        const options = {
            hostname: 'localhost',
            port: this._ipcServerPort,
            path: path,
            method: 'GET',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        };

        return new Promise((resolve,reject)=>{
            const req = http.request(options, (res) => {
                res.setEncoding('utf8');
                res.on('data', (data) => {
                    resolve(JSON.parse(data));
                });
            });

            req.on('error', (e) => {
                this.warn('IPC服务错误',{innerError:e,errorType:_Errors.IPCServerError});
                reject(e);
            });
            req.end();
        });
    }

    async _arrchive(id,hid,evtID){
        let data=await this._IPCRequest(`/ipc/${id}/arrchive/${hid}?t=${new Date().getTime()})}`);
        if(data.type==='fault') await Promise.reject(this.error('录制视频失败',{innerError:data}));

        data.path=path.relative(config.getVideoPath(),data.path);
        await Data.recordAlertVideo({pid:id,hid,id:evtID,path:data.path});
        return this.log('启用视频录制',{id,hid,evtID});
    }

    async _stopArrchive(id,hid){
        let data= await this._IPCRequest(`/ipc/${id}/stoparrchive/${hid}?t=${new Date().getTime()})}`);
        if(data.type==='fault') await Promise.reject(this.error('停止录制视频失败',{innerError:data}));
        this.log('停止视频录制成功',{id,hid});
    }

    async _moveToPoint(id,point,hid){
        let data= await this._IPCRequest(`/ipc/${id}/moveToPoint/${hid}?point=${encodeURI(JSON.stringify(point))}&t=${new Date().getTime()})}`);
        if(data.type==='fault') await Promise.reject(this.error('ptz移动失败',{innerError:data}));
        this.log('成功移动到报警位置',{id,hid});
    }

    async _alarm(id,hid){
        let data= await this._IPCRequest(`/ipc/${id}/alarm/${hid}?t=${new Date().getTime()})}`);
        if(data.type==='fault') await Promise.reject(this.error('拉响警报失败',{innerError:data}));
        this.log('成功拉响警报',{id,hid});
    }

    async _stopAlarm(id,hid){
        let data= await this._IPCRequest(`/ipc/${id}/stopAlarm/${hid}?t=${new Date().getTime()})}`);
        if(data.type==='fault') await Promise.reject(this.error('关闭警报失败',{innerError:data}));
        this.log('成功关闭警报',{id,hid});
    }

    async _OnIntrusionAlert(evt){
        this.log('收到主机报警指令',{innerEvent:evt});
        const hostID=evt.hid;
        let host=this._getHost(hostID);

        await Data.recordAlert({hid:hostID,id:evt.id,position:evt.position});

        host.monintors=[];
        let ms=await host.mointorHandle.getMointors(evt.position).catch(()=>{
            return Promise.resolve([]);
        });
        this.emit(Host.Events.StateChanged,_.extend(evt,{monintors:_.transform(ms,(result,val)=>{
            result.push({id:val.id,demo:val.demo,talk:val.talk});
        })}));
        if(ms.length){
            this.log('获取监控摄像头',{monitors:ms,innerEvent:evt});
        }
        else{
            this.warn('监测到主机报警，但未找到合适的监控摄像头',{
                errorType:_Errors.NoMointor,
                innerEvent:evt
            });
        }
        if(!runModeBS) return;

        host.monintors=ms;

        ms.map(async(ipc)=>{
            if(ipc.supportPTZ&&ipc.x!==-1)this._moveToPoint(ipc.id,ipc,hostID).catch(e=>e);
            if(true||ipc.screenshot)this._arrchive(ipc.id,hostID,evt.id).catch(e=>e);
            if(ipc.supportAlarm) this._alarm(ipc.id,hostID).catch(e=>e);
        });
    }

    _OnDeactivateAlert(evt){
        this.log('收到主机消警指令',{innerEvent:evt});
        const hostID=evt.hid;
        let host=this._getHost(hostID);
        let ms=host.monintors||[];
        this.emit(Host.Events.StateChanged,_.extend(evt,{monintors:_.transform(ms,(result,val)=>{
            result.push({id:val.id});
        })}));
        delete host.monintors;
        if(ms.length===0){
            return;
        }
        if(!runModeBS) return;
        _.forEach(ms,(ipc)=>{
            this._stopArrchive(ipc.id,hostID).catch(e=>e);
            this._stopAlarm(ipc.id,hostID).catch(e=>e);
        });
    }

    async start(){
        this.stop();
        this._states={};
        this.__hosts=await Data.getHosts();
        if(!this.hosts||!this.hosts.length) {
            this.warn('请配置主机');
            return ;
        }
        return new Promise((resolve,reject)=>{
            let i=0,ok=0;
            let addone=()=>{
                if(++i===this.hosts.length){
                    if(ok===0) return reject();
                    resolve();
                }
            };
            _.each(this.hosts,(host)=>{
                let h=new Host(host.id,host.port,null,false);
                h.on(Host.Events.StateChanged,this._host_state_changed);
                h.connect().then(()=>{
                    host.mointorHandle=new IPCMointor(host.id);
                    host.instance=h;
                    ok++;
                    addone();
                }).catch(()=>{
                    addone();
                    h.removeListener(Host.Events.StateChanged,this._host_state_changed);
                });
            });
            this.log('主机服务已启动');
        });
    }

    stop(){
        let hosts=this.__hosts;
        if(!hosts||hosts.length===0) return;
        let running=false;
        _.each(hosts,(host)=>{
            if(host.instance){
                running=true;
                host.instance.removeListener(Host.Events.StateChanged,this._host_state_changed);
                host.instance.disConnect().catch(e=>e);
                delete host.instance;
                delete host.mointorHandle;
            }
        });
        if(running)this.log('主机服务已停止');
    }

    clearAlarm(id){
        this.log('收到主机复位申请',{id});
        let host=this._getHost(id);
        if(host&&host.instance)return host.instance.clearAlarm();
        return Promise.reject('不存在主机');
    }

    get hosts(){
        return this.__hosts;
    }

    get hostsState() {
        return this._states;
    }
}

exports=module.exports=HostServer;
