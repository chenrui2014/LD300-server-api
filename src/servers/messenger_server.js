/**
 * Created by Luky on 2017/10/19
 */

const EventEmitter = require('events').EventEmitter;
const assert=require('assert');

const _Events={
  newClient:'newClient'
};

class Server extends  EventEmitter{
    constructor(hostServer){
        super();
        this._hostServer=hostServer;
        assert.ok(hostServer);
    }
    static get Events(){
        return _Events;
    }
    notifyHostsState(client,msg){throw new Error('未实现函数notifyHostsState');}
    notifyHostStateChanged(msg){throw new Error('未实现函数notifyHostStateChanged');}
    _onReceiveMsgIntrusionAlert(hid){
        this._hostServer.clearAlarm(hid);
    }
    start(){throw new Error('未实现函数start');}
    stop(){throw new Error('未实现函数stop');}
}

exports=module.exports=Server;