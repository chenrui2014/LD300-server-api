/**
 * Created by Luky on 2017/8/17.
 */
const Host=require('../host/host');
const HostServer=require('./host_server');
const IPCServer=require('./ipc_server_master');
const {Parser}=require('../log/log');
const config=global.server_config||require('../config/config');
const _=require('lodash');
const projectName=_.get(config,'runMode.project','');
const runModeBS=_.get(config,'runMode.type','BS')==='BS';
const MessengerServer=require('./messenger_server_http_socket');
const MessengerServerSocket=require('./messenger_server_socket');
const MessengerServerBase=require('./messenger_server');
const {getInterface}=require('./interfaces/addin');

class StartUp{
    constructor(){
        Parser(this,'startup.js');
        this._host_state_changed = this._onHostStateChanged.bind(this);
        this._push_server_new_client = this._onNewClient.bind(this);
    }

    _onHostStateChanged(evt){
        this.log('尝试向前台同步主机状态',{innerEvent:evt});
        this._messengerServer&&this._messengerServer.notifyHostStateChanged(evt);
    }

    _onNewClient(client){
        this.log('尝试向新连入客户端同步主机状态');
        this._hostServer&&this._messengerServer.notifyHostsState(client,this._hostServer.hostsState);
    }

    async start() {
        this.stop();
        let hostServer = new HostServer();
        //为了不遗漏数据，先启动服务，后启动状态推送服务
        await hostServer.start().catch((e)=>{
            this.error('主机服务启动失败',{innerError:e});
            return Promise.reject(e);
        });
        this._hostServer=hostServer;
        let messengerServer = runModeBS?
            new MessengerServer(hostServer):
            new MessengerServerSocket(hostServer,null,getInterface(projectName));
        hostServer.on(Host.Events.StateChanged, this._host_state_changed);
        messengerServer.on(MessengerServerBase.Events.newClient, this._push_server_new_client);
        await messengerServer.start().catch(()=>{
            hostServer.removeListener(Host.Events.StateChanged, this._host_state_changed);
            messengerServer.removeListener(MessengerServerBase.Events.newClient, this._push_server_new_client);
            this._hostServer=null;
            this.error('消息服务启动失败',{innerError:e});
            return Promise.reject(e);
        });
        this._messengerServer=messengerServer;
        if(runModeBS){
            this._ipcServer=new IPCServer();
            await this._ipcServer.start().catch();
        }
        this.log('服务已启动');
    }

    stop(){
        if(this._hostServer){
            this._hostServer.removeListener(Host.Events.StateChanged,this._host_state_changed);
            this._hostServer.stop();
            this._hostServer=null;
        }

        if(this._messengerServer){
            this._messengerServer.removeListener(MessengerServerBase.Events.newClient, this._push_server_new_client);
            this._messengerServer=null;
        }

        if(this._ipcServer){
            this._ipcServer.stop();
            this._ipcServer=null;
        }
        this.log('服务已停止');
    }
}

exports=module.exports=StartUp;