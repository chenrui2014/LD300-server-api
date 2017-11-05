/**
 * Created by Luky on 2017/7/17.
 */

const Host=require('../host/host');
const HostServer=require('./host_server');
const io=require('socket.io');
const config=require('../../config/config');
const _=require('lodash');
const EventEmitter = require('events').EventEmitter;
const IPC=require('../ipcs/base/ipc');

class StateServer extends EventEmitter{
    constructor() {
        super();
        this._port=_.get(config,'state_server.port',3001);
        this._path=_.get(config, 'state_server.path', '/stateServer');
        this._state={};
    }


    _onHostStateChanged(evt){
        const hostID=evt.hid;
        let type=evt.type;
        if(type===Host.Events.ReConnected)
        {
            type=Host.Events.Open;
        }
        if(type===Host.Events.Error&&evt.errorType===Host.Errors.writeError){
            return this._onResetResponse(evt);
        }
        const oldState=_.get(this._state,`hs${hostID}.state`,'');
        if(oldState!==type){
            this._emitEveryone(this._state[`hs${hostID}`]={hid:hostID,state:type,handle:'hostState'});
        }
    }

    _onAlarmStateChanged(evt){
        const hostID=evt.hid;
        const type=evt.type;
        const oldState=_.get(this._state,`ha${hostID}.state`,'');
        if(type!==oldState){
            this._emitEveryone(this._state[`ha${hostID}`]=_.extend(evt,{handle:'hostState'}));
        }
    }

    _onResetResponse(evt){
        const hostID=evt.hid;
        const type=evt.type;
        const oldState=_.get(this._state,`hr${hostID}.state`,'');
        if(type!==oldState){
            this._emitEveryone(this._state[`hr${hostID}`]={id:hostID,state:type,handle:'resetCB'});
        }
    }

    _onServerStateChanged(evt){
        let type=evt.type;
        if(type===HostServer.Events.Error){
            if(evt.errorType==='DemoMoveFault'){
                this._emitEveryone(_.extend({handle:'notify'},evt));
                return;
            }
            if(evt.errorType==='NoMointor') return this._onMointorStateChanged(evt);
            type=evt.errorType;
        }
        const oldState=_.get(this._state,`ss.state`,'');
        if(type!==oldState){
            this._emitEveryone(this._state['ss']={state:type,handle:'serverState'});
        }
    }

    _onMointorStateChanged(evt){
        let type=evt.type;
        if(type!==HostServer.Events.Mointor){
            type=evt.errorType;
        }
        const oldState=_.get(this._state,`ms.state`,'');
        if(type!==oldState){
            this._emitEveryone(this._state['ms']=_.extend({},evt,{handle:'mointorState'}));
        }
    }

    addHostListener(hostServer){
        hostServer.on(Host.Events.Open,this._host_open=this._onHostStateChanged.bind(this));
        hostServer.on(Host.Events.ReConnected,this._host_open=this._onHostStateChanged.bind(this));
        hostServer.on(Host.Events.Error, this._host_err=this._onHostStateChanged.bind(this));
        hostServer.on(Host.Events.Close, this._host_close=this._onHostStateChanged.bind(this));

        hostServer.on(Host.Events.Normal,this._host_normal=this._onAlarmStateChanged.bind(this));
        hostServer.on(Host.Events.Alarm,this._host_alarm=this._onAlarmStateChanged.bind(this));

        hostServer.on(Host.Events.Reset,this._host_reset=this._onResetResponse.bind(this));

        hostServer.on(HostServer.Events.StartUp,this._host_server_start=this._onServerStateChanged.bind(this));
        hostServer.on(HostServer.Events.Stopped,this._host_server_stop=this._onServerStateChanged.bind(this));
        hostServer.on(HostServer.Events.Mointor,this._host_server_mointor=this._onMointorStateChanged.bind(this));
        hostServer.on(HostServer.Events.Error,this._host_server_error=this._onServerStateChanged.bind(this));
    }

    removeHostListener(hostServer){
        if(!this._host_open){
            return;
        }
        hostServer.removeListener(Host.Events.Open,this._host_open);this._host_open=null;
        hostServer.removeListener(Host.Events.Normal,this._host_normal);this._host_normal=null;
        hostServer.removeListener(Host.Events.Error, this._host_err);this._host_err=null;
        hostServer.removeListener(Host.Events.Alarm,this._host_alarm);this._host_alarm=null;
        hostServer.removeListener(Host.Events.Close, this._host_close);this._host_close=null;
        hostServer.removeListener(Host.Events.Reset,this._host_reset);this._host_reset=null;
        hostServer.removeListener(HostServer.Events.StartUp,this._host_server_start);this._host_server_start=null;
        hostServer.removeListener(HostServer.Events.Stopped,this._host_server_stop);this._host_server_stop=null;
        hostServer.removeListener(HostServer.Events.Mointor,this._host_server_mointor);this._host_server_mointor=null;
        hostServer.removeListener(HostServer.Events.Error,this._host_server_error);this._host_server_error=null;
    }

    addIPCListener(ipc){
        ipc.on(IPC.Events.Connected,this._ipc_connected=this._ipc_connected||this._emitEveryone.bind(this,'ipc'));
        ipc.on(IPC.Events.DisConnected,this._ipc_disConnected=this._ipc_disConnected||this._emitEveryone.bind(this,'ipc'));
        ipc.on(IPC.Events.RealPlay,this._ipc_realPlay=this._ipc_realPlay||this._emitEveryone.bind(this,'ipc'));
        ipc.on(IPC.Events.StopRealPlay,this._ipc_stopRealPlay=this._ipc_stopRealPlay||this._emitEveryone.bind(this,'ipc'));
        ipc.on(IPC.Events.AudioPlay,this._ipc_audioPlay=this._ipc_audioPlay||this._emitEveryone.bind(this,'ipc'));
        ipc.on(IPC.Events.AudioStopPlay,this._ipc_audioStopPlay=this._ipc_audioStopPlay||this._emitEveryone.bind(this,'ipc'));
        ipc.on(IPC.Events.Alarm,this._ipc_alarm=this._ipc_alarm||this._emitEveryone.bind(this,'ipc'));
        ipc.on(IPC.Events.AlarmStop,this._ipc_alarmStop=this._ipc_alarmStop||this._emitEveryone.bind(this,'ipc'));
        ipc.on(IPC.Events.Alive,this._ipc_alive=this._ipc_alive||this._emitEveryone.bind(this,'ipc'));
        ipc.on(IPC.Events.Offline,this._ipc_offline=this._ipc_offline||this._emitEveryone.bind(this,'ipc'));
        ipc.on(IPC.Events.Error,this._ipc_error=this._ipc_error||this._emitEveryone.bind(this,'ipc'));
    }

    removeIPCListener(ipc){
        if(!this._ipc_connected)return;
        ipc.removeListener(IPC.Events.Connected,this._ipc_connected);this._ipc_connected=null;
        ipc.removeListener(IPC.Events.DisConnected,this._ipc_disConnected);this._ipc_disConnected=null;
        ipc.removeListener(IPC.Events.RealPlay,this._ipc_realPlay);this._ipc_realPlay=null;
        ipc.removeListener(IPC.Events.StopRealPlay,this._ipc_stopRealPlay);this._ipc_stopRealPlay=null;
        ipc.removeListener(IPC.Events.AudioPlay,this._ipc_audioPlay);this._ipc_audioPlay=null;
        ipc.removeListener(IPC.Events.AudioStopPlay,this._ipc_audioStopPlay);this._ipc_audioStopPlay=null;
        ipc.removeListener(IPC.Events.Alarm,this._ipc_alarm);this._ipc_alarm=null;
        ipc.removeListener(IPC.Events.AlarmStop,this._ipc_alarmStop);this._ipc_alarmStop=null;
        ipc.removeListener(IPC.Events.Alive,this._ipc_alive);this._ipc_alive=null;
        ipc.removeListener(IPC.Events.Offline,this._ipc_offline);this._ipc_offline=null;
        ipc.removeListener(IPC.Events.Error,this._ipc_error);this._ipc_error=null;
    }

    start(hostServer/*,ipcs=null*/){
        if(this._server) return;

        this._server=io({
            path:this._path,
            serveClient:false
        });

        this._server.listen(this._port);
        //this._ctClent=0;
        this._server.on('connection',(client)=>{
            _.forEach(this._state,(evt/*,key*/)=>{
                const handle=evt.handle;
                evt=_.clone(evt);
                delete evt.handle;
                client.emit(handle,evt);
            });
            client.on('disconnection',()=>{
            });
        });

        this.addHostListener(hostServer);
        this._hostServer=hostServer;
/*        if(ipcs){
            _.forEach(ipcs,(ipc)=>{
                this.addIPCListener(ipc);
            });
        }
        this._ipcs=ipcs;*/
    }

    PTZ(id,handle,op,params){

    }

    live(id){
    }

    stop(){
        if(this._hostServer){
            this.removeHostListener(this._hostServer);
            this._hostServer=null;
        }
/*        if(this._ipcs){
            _.forEach(this._ipcs,(ipc)=>{
                this.removeIPCListener(ipc);
            });
            this._ipcs=null;
        }*/
        if(this._server){
            this._server.removeAllListeners();
            this._server.close();
            this._server=null;
        }
    }

    _emitEveryone(event){
        let name=event.handle;
        event=_.clone(event);
        delete event.handle;
        this._server&&this._server.emit(name,event,{for:'everyone'});
    }
}


exports=module.exports=StateServer;