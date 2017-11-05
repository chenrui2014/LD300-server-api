const Live=require('../../app/servers/ipc_live_server');
const http = require('http');
const _=require('lodash');
const DHIPC=require('../../app/ipcs/dahua/dh_ipc');
const ipcOptions=require('../data/dhipc.json');
const expect=require('chai').expect;
const fs=require('fs');
const WebSocket=require('ws');
const port=3001;

describe('摄像头直播流服务测试,请先打开摄像头98',()=>{

    let server=null,ipc=null,live=null;
    before(()=>{
        server=http.createServer();
        server.listen(port);
        ipc=new DHIPC(ipcOptions);
        live=new Live(server,ipc,'',{autoClose:true});
    });

    after(()=>{
       server.close();
    });

    it('启动摄像头视频输出',(done)=>{
        live._play().then((data)=>{
            expect(!data).equal(false);
            expect(!live._cache).equal(false);
            expect(live.path).equal(`/live/${ipc.id}`);
            live._stopPlay();
            expect(!live._cache).equal(true);
            done();
        }).catch(done);
    });

    it('流保存成文件,并自动关闭流',(done)=>{
        let x=0;
        live.on('file',(data)=>{
            x++;
            expect(data.path.length>0).equal(true);
            fs.exists(data.path, (exists) => {
                expect(exists).equal(true);
            });
        });
        live.on('fileClosed',(data)=>{
            x++;
            expect(data.path.length>0).equal(true);
            fs.exists(data.path, (exists) => {
                expect(exists).equal(true);
            });
        });
        live.on('close',(data)=>{
            x++;
            expect(data.id).equal(ipc.id);
            expect(data.path).equal(`/live/${ipc.id}`);
        });
        live.arrchive(1).then((path)=>{
            expect(!live._file).equal(false);
            expect(path.length>0).to.equal(true);
            fs.exists(path, (exists) => {
                expect(exists).equal(true);
            });
            setTimeout(()=>{
                live.stopArrchive();
                expect(!live._file).equal(true);
                let state=fs.statSync(path);
               expect(state.size>0).equal(true);
               expect(x).equal(3);
               done();
            },2000);
        }).catch(done);
    });

    it('启动websocket', async (done)=>{
        let url=`ws://localhost:${port}${live.path}`;
        let x=0;
        live.on('open',()=>{
            expect(x++).equal(0);
        });
        await live.openWSS().catch(done);
        let ws=new WebSocket(url);
        let Ping=(data)=>{
            expect(!data).equal(false);
            ws.pong('',false,true);
            expect(x++).equal(1);
            ws.close();
        };
        ws.on('ping',Ping);
        ws.on('close',()=>{
            ws.removeAllListeners();
        });
        live.on('close',()=>{
            done();
        });
        let FLVVerify=(data)=>{
            ws.removeListener('message',FLVVerify);
            expect(data.indexOf(Buffer.from("FLV"))).equal(0);
        };
        ws.on('message',FLVVerify);
    });
});