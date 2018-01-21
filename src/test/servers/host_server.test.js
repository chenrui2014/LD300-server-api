const {db,file}=require('../init');
let {setHostData,setMData,setIpcData}=require('../modify_config');
let Server=require('../../servers/host_server');
let _=require('lodash');
let expect=require('chai').expect;
let vHost=require('../host/virtual_host');
let Host=require('../../host/host');
const SerialPort=require('../../serialport/serialport');
const IPCServer=require('../../servers/ipc_server_child').server;
//const M=require('../../servers/ipc_mointors');
const Factory=require('../../servers/ipc_factory');

let port=0;
async function getUrl(){
    if(port) return port;
    let a=IPCServer.address();
    if(a&&'port' in a) return port=a.port;
    IPCServer.on('listening',()=>{
        return port=IPCServer.address().port;
    });
}

describe('主机服务测试用例',()=>{
    let dbInstance=null;
    before(async ()=>{
        //打开注释启动数据库取数据
        dbInstance=await db();
    });

    it('启动关闭',(done)=>{
        let server=new Server();
        setHostData([{id:1,port:'\\\\.\\COM2'},{id:1,port:'\\\\.\\COM4'}]);
        server.start().then(()=>{
            let testHostStart=()=>{
                _.forEach(server.hosts,(host)=>{
                    expect(host.instance.isConnected).equal(true);
                });
                server.stop();
                done();
            };
            setTimeout(testHostStart,200);
        }).catch(done);
    });

    describe('服务状态事件测试',()=>{
        let port;
        let loopID=0;
        before((done)=>{
            port=new SerialPort(1,vHost.portOptions);
            port.connect().then(done).catch(done);
        });
        after((done)=>{
            port.disConnect().then(done).catch(done);
        });
        it('状态改变测试unknown->normal',(done)=>{
            let server=new Server();
            let state=Host.States.Unknown;
            server.on(Host.Events.StateChanged,(data)=>{
                expect(data.type).equal(Host.Events.StateChanged);
                expect('id' in data).equal(true);
                expect('hid' in data).equal(true);
                expect(data.stateOld===state).equal(true);
                expect(data.stateNew===Host.States.Normal).equal(true);
                server.stop();
                clearInterval(loopID);
                setTimeout(done,200);
            });
            setHostData([{id:1,port:'\\\\.\\COM2'}]);
            server.start().then(()=>{
                loopID=setInterval(()=>{
                    port.write(vHost.nomalCmd);
                },200);
            }).catch(done);
        });

        it('报警，启动并停止视频录像',(done)=>{
            getUrl().then((port)=>{
                let server=new Server({ipc_server:{
                    port:port
                }});
                server._arrchive(1,1).then(()=>{
                    setTimeout(()=>{
                        server._stopArrchive(1,1).then(done).catch(done);
                    },1800);
                }).catch(done);
            });
        });

        it('报警,调摄像头',(done)=>{
            getUrl().then((httpport)=> {
                let server = new Server({
                    ipc_server: {
                        port: httpport
                    }
                });
                server.on(Host.Events.StateChanged,(evt)=>{
                    expect(evt.type).equal(Host.Events.StateChanged);
                    expect(evt.stateNew).equal(Host.States.Alarm);
                    expect(evt.monintors.length).equal(1);
                    server.stop();
                    clearInterval(loopID);
                    done();
                });
                setHostData([{id:1,port:'\\\\.\\COM2'}]);
                server.start().then(()=>{
                    //server.hosts[0].m=mt;
                    loopID=setInterval(()=>{//position 82 有摄像头，2000没有
                        port.write(vHost.AlarmCmd(82));
                    },200);
                }).catch(done);

            });
        });

        it('报警,找不到调摄像头',(done)=>{
            getUrl().then((httpport)=> {
                let server = new Server({
                    ipc_server: {
                        port: httpport
                    }
                });
                server.on(Host.Events.StateChanged,(evt)=>{
                    expect(evt.type).equal(Host.Events.StateChanged);
                    expect(evt.stateNew).equal(Host.States.Alarm);
                    expect(evt.monintors.length).equal(0);
                    server.stop();
                    clearInterval(loopID);
                    done();
                });
                setHostData([{id:1,port:'\\\\.\\COM2'}]);
                server.start().then(()=>{
                    //server.hosts[0].m=mt;
                    loopID=setInterval(()=>{
                        port.write(vHost.AlarmCmd(2000));
                    },200);
                }).catch(done);

            });
        });

        it('调用摄像头机-枪机',(done)=>{
            getUrl().then(async (httpport)=> {
                let server = new Server({
                    ipc_server: {
                        port: httpport
                    }
                });
                let ipc= await Factory.getIPC(1);
                let onVideo=()=>{
                    ipc.removeListener('video',onVideo);
                    clearInterval(loopID);
                    setTimeout(()=>{
                        port.write(vHost.nomalCmd);
                    },1800);
                };

                ipc.on('video',onVideo);
                setHostData([{id:1,port:'\\\\.\\COM2'}]);
                server.start().then(()=>{
                    server.hosts[0].instance.on(Host.Events.StateChanged,(data)=>{
                        if(data.stateNew===Host.States.Normal){
                            server.stop();
                            done();
                        }
                    });
                    loopID=setInterval(()=>{
                        port.write(vHost.AlarmCmd(84));
                    },200);
                });
            });
        });

        it('调用离线摄像头',(done)=>{
            getUrl().then((httpport)=> {
                let server = new Server({
                    ipc_server: {
                        port: httpport
                    }
                });
                setHostData([{id:1,port:'\\\\.\\COM2'}]);
                server.start().then(()=>{
                    server.on('error',(err)=>{
                        clearInterval(loopID);
                        expect(err.type).equal(Server.Events.Error);
                        expect(err.errorType).equal(Server.Errors.IPCConnectError);
                        server.stop();
                        done();
                    });
                    loopID=setInterval(()=>{
                        port.write(vHost.AlarmCmd(784));
                    },200);
                }).catch(done);

            });
        });
    });

    describe('消除警报',()=>{
        let vh=null;
        before((done)=>{
            vh=new vHost(1);
            vh.start().then(done).catch(done);
        });
        it('启动一台主机',(done)=>{
            let server = new Server();
            setHostData([{id:1,port:'\\\\.\\COM2'}]);
            server.start().then(()=>{
                server.clearAlarm(1).catch(done);
            }).catch(done);
            vh.on('reset',(data)=>{
                expect(data.port).equal(1);
                server.stop();
                done();
            });
        });
        after((done)=>{
            vh.stop().then(done).catch(done);
        });
    });
});