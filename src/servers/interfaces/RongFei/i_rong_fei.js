/**
 * Created by Luky on 2017/10/21.
 */

const _=require('lodash');
const config=global.server_config||require('../../../config/config');
const Formatter=require('../cmd_formatter');
const Host=require('../../../host/host');
const partition=config.getData('partition_host_config.json');

class RFCmdFormatter extends Formatter{
    formatHostStateChanged(index,hostEvt){
        /*    [
                {name:'length',size:8,val:8},
                {name:'index',size:12,val:(index&0xfff)},
                {name:'hostID',size:8,val:(hid&0xff)},
                {name:'type',size:4,val:(type&0xf)},
                {name:'extParam',size:32,val:(type&0xffff)}
            ]);*/
        let type=0;let ext=0;
        if(hostEvt.stateNew===Host.States.Alarm){
            type=1;
            ext=this.getPartition(hostEvt.hid,hostEvt.position);
            if(-1===ext){
                return null;
            }
        }
        else if(hostEvt.stateNew===Host.States.Error){
            type=3;//主机异常
        }
        else if(hostEvt.stateNew===Host.States.Unknown){
            type=4;//主机失联
        }
        let ret=Buffer.allocUnsafe(8);
        let i=0;
        ret.writeUInt32BE(0x08000000|((index&0xfff)<<12)|((hostEvt.hid&0xff)<<4)|(type&0xf),i,true);i+=4;
        ret.writeUInt32BE(ext,i,true);
        return ret;
    }

    formatReceived(cmd){
        if(cmd.length!==8) return {type:Formatter.CmdReceived.unKnown};
        let data1=cmd.readUInt32BE(0,true);
        let hid=0x00000fff&data1;
        let cmdType=hid&0xf;
        hid=hid>>4;
        if(cmdType===0){
            return {type:Formatter.CmdReceived.clear,hid};
        }
        return {type:Formatter.CmdReceived.unKnown};
    }

    getPartition(hostid,position){
        if(hostid>=partition.length){
            return -1;
        }
        let pi=partition[hostid].partition;
        let ret=_.find(pi,(dis)=>{return dis.distance>=position})||{index:-1};
        return ret.index;
    }
}

exports=module.exports=RFCmdFormatter;