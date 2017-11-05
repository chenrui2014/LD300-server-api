/**
 * Created by Luky on 2017/7/28.
 */
//let live=require('../app/servers/__live_server');
let live=require('../../../app/servers/live_server');
let factory=require('../../../app/servers/ipc_factory');
//let FLVDemuxer=require('../node_modules/flv.js/src/demux/flv-demuxer');
let fs=require('fs');
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

    function dolive(id,done){
        let l=new live(server,id);
        l.open();
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