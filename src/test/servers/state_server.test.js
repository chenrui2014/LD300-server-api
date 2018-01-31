const StateServer=require('../../app/servers/host_state_server');
const Server=require('../../app/servers/host_server');
const http=require('http');
const expect=require('chai').expect;
const vHost=require('../../host/virtual_host');

describe('状态服务测试',()=>{
    let server;
    before((done)=>{
        server = new Server();
        server.start([{id:1,port:'\\\\.\\COM2'}]).then(()=>{
            done();
        }).catch(done);
    });
    after(()=>{
       server.stop();
    });
    it('端口被暂用，启动失败',(done)=>{
        const hserver = http.createServer((req, res) => {
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end('okay');
        });
        hserver.listen('3001',()=>{
            let s=new StateServer();
            s.start(server).catch((err)=>{
                expect(err.code).equal('EADDRINUSE');
                done();
            });
        });
    });
    it('启用并停止',(done)=>{
        let s=new StateServer();
        s.start(server).then(()=>{
            s.stop();
            const hserver = http.createServer((req, res) => {
                res.writeHead(200, { 'Content-Type': 'text/plain' });
                res.end('okay');
            });
            hserver.listen('3001',()=> {
                done();
            });
        }).catch(done);
    });

    describe('启动状态服务，提供前台测试',()=>{
        let vh=null,s=null;
        before((done)=>{
            vh=new vHost(1);
            s=new StateServer();
            Promise.all([vh.start(),s.start(server)]).then(()=>{
                done();
            }).catch(()=>{
                done(false);
            });
        });
        after(()=>{
            vh.stop();
            s.stop();
        });
        it('先报错，然后还原',(done)=>{
            vh.send(vHost.CMD.alarm,10);
            vh.on('reset',(data)=>{
                expect(data.port).equal(1);
                setTimeout(done,9000);
            });
            setTimeout(()=>{
                server.clearAlarm(1).catch(done);
            },9000);
        });
    });
});