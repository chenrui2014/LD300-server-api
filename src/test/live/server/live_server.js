/**
 * Created by Luky on 2017/7/28.
 */
require('../../modify_config');
let live=require('../../../app/servers/ipc_live_server');
let fs=require('fs');
let IPCFactory=require('../../../app/servers/ipc_factory');

const http = require('http');
const wOption = {
    flags: 'w',
    encoding: null,
    fd: null,
    mode: 0o666,
    autoClose: true
};

let server=http.createServer();
server.listen(3000);

describe('集成测试',()=>{

   async function dolive(id,done){
        let ipc=await IPCFactory.getIPC(id)
        let l=new live(server,ipc);
        l.openWSS();
        l.on('close',()=>{
            done();
        });
    }

    it('大华枪机视频sdk测试',(done)=>{
        dolive(1,done);
    });

    it('大华枪机视频onvif测试',(done)=>{
        dolive(2,done);
    });

    xit('hopewell枪机视频onvif测试',(done)=>{
        dolive(3,done);
    });

    it('大华球机视频sdk测试',(done)=>{
        dolive(4,done);
    });

    it('大华球机视频onvif测试',(done)=>{
        dolive(5,done);
    });
});