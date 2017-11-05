const http = require('http');
const {server}=require('../../app/servers/ipc_server_child');
const expect=require('chai').expect;
let port=0;
async function getUrl(){
    if(port) return port;
    let a=server.address();
    if(a&&'port' in a) return port=a.port;
    server.on('listening',()=>{
        return port=server.address().port;
    });
}

async function send(path) {
    let port=await getUrl();
    const options = {
        hostname: 'localhost',
        port: port,
        path: path,
        method: 'GET',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    };
    return new Promise((resolve)=>{
        const req = http.request(options,(res)=>{
            res.setEncoding('utf8');
            res.on('data', (data) => {
                resolve(JSON.parse(data));
            });
        });
        req.end();
    });

}

describe('直播子进程http服务测试',()=>{
    it('直播及获取地址',(done)=>{
        send('/ipc/1/live').then((data)=>{
            expect(data.id-0).equal(1);
            expect(data.type).equal('succeed');
            expect(data.fn).equal('live');
            expect(data.url.indexOf(`ws://localhost:${port}/live/1`)>-1).equal(true);
            done();
        });
    });

    it('获取不存在的摄像头播放地址',(done)=>{
        send('/ipc/188/live').then((data)=>{
            expect(data.id).equal(188);
            expect(data.type).equal('fault');
            expect(data.fn).equal('live');
            done();
        });
    });

    it('启用文件流',(done)=>{
       send('/ipc/1/arrchive/1').then((data)=>{
           expect(data.id-0).equal(1);
           expect(data.hid-0).equal(1);
           expect(data.type).equal('succeed');
           expect(data.fn).equal('arrchive');
           done();
       });
    });

    it('关闭文件流',(done)=>{
        let stop=()=> {
            send('/ipc/1/stoparrchive/1').then((data) => {
                expect(data.id).equal(1);
                expect(data.fn).equal('stopArrchive');
                done();
            });
        };
        send('/ipc/1/arrchive/1').then((data)=>{
            expect(data.type).equal('succeed');
            setTimeout(stop,2000);
        });
    });

    describe('ptz测试',()=>{
        it('无人占用时申请',(done)=>{
            send('/ipc/1/ptz/zoomAdd').then((data)=>{
                expect(data.type).equal('succeed');
                expect(data.handle.length>0).equal(true);
                expect(data.limit>0).equal(true);
                done();
            });
        });
        describe('标记占有',()=>{
            let handle='',timeout=0;
            before((done)=>{
                send('/ipc/1/ptz/zoomAdd').then((data)=>{
                    expect(data.type).equal('succeed');
                    timeout=data.limit;
                    handle=data.handle;
                    done();
                });
            });

            it('二次使用',(done)=>{
                send('/ipc/1/ptz/zoomAdd?handle='+handle).then((data)=>{
                    expect(data.type).equal('succeed');
                    expect(data.handle).equal(handle);
                    done();
                });
            });

            it('释放所有权',(done)=>{
               send('/ipc/1/freeptz?handle='+handle).then((data)=>{
                  expect(data.type).equal('succeed');
                  done();
               });
            });

            it('他人申请',(done)=>{
                send('/ipc/1/ptz/zoomAdd').then((data)=>{
                    expect(data.type).equal('fault');
                    done();
                });
            });

            it('释放后再申请',(done)=>{
                setTimeout(()=>{
                    send('/ipc/1/ptz/zoomAdd').then((data)=>{
                        expect(data.type).equal('succeed');
                        done();
                    });
                },timeout+1);
            });
        });
    });

});