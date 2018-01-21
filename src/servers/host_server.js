/**
 * Created by Luky on 2017/6/23.
 */
const Host=require('../host/host');
const _ = require('lodash');
const EventEmitter = require('events').EventEmitter;
const util = require('util');
const assert=require('assert');
const factory=require('./ipc_factory');
const config=global.server_config||require('../config/config');
const ipcPort=_.get(config,'ipc_server.port',3000);
const http = require('http');
const {Parser}=require('../log/log');
const IPCMointor=require('./ipc_mointors');
const runModeOne=_.get(config,'runMode.type','one')==='one';
const Data=require('./data_server');
const EventService = require('../services/eventService');
const moment = require('moment');
const path=require('path');

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
        else if(data.state===Host.States.Normal){
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

        data.path=path.relative(config.root,data.path);
        //*******将录制视频的摄像头以及录像地址存入数据库*******//
        let result = await EventService.find_one(evtID);
        if(result){
            let video = result.video;
            video.push({pid:id,path:data.path});
            await EventService.edit_event({id:evtID},{video:video});
        }else{
            let event = {};
            event.id = evtID;
            event.happenTime = moment().format('YYYY年MM月DD日 HH:mm:ss');
            event.hid = hid;
            event.video = [{pid:id,path:data.path}];
            //event.path = data.path
            //event.pid = id;

            await EventService.add_event(event);
        }
        //********************************//

        //await Data.recordAlertVideo({pid:id,hid,id:evtID,path:data.path});
        return this.log('启用视频录制',{id,hid,evtID});
    }

    async _stopArrchive(id,hid){
        let data= await this._IPCRequest(`/ipc/${id}/stoparrchive/${hid}?t=${new Date().getTime()})}`);
        if(data.type==='fault') await Promise.reject(this.error('停止录制视频失败',{innerError:data}));
        this.log('停止视频录制成功',{id,hid});
    }

    async _OnIntrusionAlert(evt){
        this.log('收到主机报警指令',{innerEvent:evt});
        const hostID=evt.hid;
        let host=this._getHost(hostID);

        //*******将报警事件添加到数据库*******//
        let event = {};
        event.id = evt.id;
        event.happenTime = moment().format('YYYY年MM月DD日 HH:mm:ss');
        event.position = evt.position;
        event.hid = hostID;

        await EventService.add_event(event);
        //********************************//

        //await Data.recordAlert({hid:hostID,id:evt.id,position:evt.position});
        
        
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

        if(!runModeOne) return;

        _.forEach(ms,(msi)=>{
            factory.getIPC(msi.id).then((ipc)=>{
                host.monintors.push(ipc);
                this._arrchive(ipc.id,hostID,evt.id).catch(e=>e);
                if(!ipc.supportAlarm&&!ipc.supportPTZ){
                    return;
                }

                ipc.connect().then(()=>{
                    let actions=[];
                    if(ipc.supportAlarm){
                        actions.push(ipc.alarm());
                    }
                    if(ipc.supportPTZ){
                        actions.push(ipc.moveToPreset(msi));
                    }
                    Promise.all(actions).then(()=>{
                        ipc._disConnect().catch(e=>e);
                    }).catch((e)=>{
                        this.warn('移动摄像头到报警位置或启动警报错误时发生错误',{
                            errorType:_Errors.LinkFault,
                            id:ipc.id,
                            innerError:e,
                            innerEvent:evt
                        });
                        ipc.disconnect().catch(e=>e);
                    });
                }).catch(e=>{
                    this.error('摄像头连接出错',{
                        errorType:_Errors.IPCConnectError,
                        id:msi.id,
                        innerError:e,
                        innerEvent:evt
                    });
                });
            }).catch(()=>{this.error('摄像头实例化失败');});
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
        if(!runModeOne) return;
        _.forEach(ms,(ipc)=>{
            this._stopArrchive(ipc.id,hostID).catch(e=>e);
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
