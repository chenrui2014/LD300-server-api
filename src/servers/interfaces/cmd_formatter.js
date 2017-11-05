/**
 * Created by Luky on 2017/10/21.
 */
const config=global.server_config||require('../../config/config');
const _=require('lodash');
const path=require('path');
let file=_.get(config,'runMode.interfaces','');
if(file)file=path.resolve(config.root,'app/servers/interfaces',file);

const _Received={
  'clear':'clear',
  'unKnown':'unKnown'
};

class CmdFormatter{
    //hid,type,stateNew,position
    formatHostStateChanged(index,hostEvt){throw new Error('未实现接口hostStateChanged');}
    formatReceived(cmd){throw new Error('未实现接口receive');}
    static get CmdReceived() {
        return _Received;
    }
}

exports=module.exports=CmdFormatter;