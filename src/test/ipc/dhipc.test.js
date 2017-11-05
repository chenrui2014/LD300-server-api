/**
 * Created by Luky on 2017/7/2.
 */
const DHIPC=require('../../app/ipcs/dahua/dh_ipc');
const jIPC=require('../data/dhipc.json');
const jIPCDemo=require('../data/dhipc_demo.json');
const expect = require('chai').expect;
const IPC=require('../../app/ipcs/base/ipc');
let fs=require('fs');
const wOption = {
    flags: 'w',
    encoding: null,
    fd: null,
    mode: 0o666,
    autoClose: true
};

describe('大华IPC直连测试', function() {
    xit('连接测试',function(done){
        let ipc=new DHIPC(jIPC);
        ipc.connect().then(()=>{
            console.log('链接成功');
            expect(ipc.isConnected).equal(true);
            ipc.disConnect().then(done).catch(done);
        }).catch(done);
    });

    xit('视频流测试',function(done){
        let ipc=new DHIPC(jIPC);
        ipc._realPlay(function(id,type,data,size){
            console.log(`id:${id},type:${type},size:${size}`);
        }).then(()=>{
            setTimeout(()=>{
                console.log('played');
                return ipc._stopRealPlay().then(()=>{
                    console.log('stoped');
                    return ipc.disConnect().then(done).catch(done);
                }).catch(done);
            },1000);
        }).catch(done);
    });

    function move(d,done) {
        let ipc=new DHIPC(jIPCDemo);
        ipc.move(d).then().catch(done);
        setTimeout(()=>{
            ipc.ptzStop().then(done).catch(done);
        },400);
    }

    xit('ptz-move-up',(done)=>{
        move(IPC.Directions.top,done);
    });

    xit('ptz-move-down',(done)=>{
        move(IPC.Directions.down,done);
    });

    xit('ptz-move-left',(done)=>{
        move(IPC.Directions.left,done);
    });

    xit('ptz-move-right',(done)=>{
        move(IPC.Directions.right,done);
    });

    xit('ptz-move-topleft',(done)=>{
        move(IPC.Directions.lefttop,done);
    });

    xit('ptz-move-rightdown',(done)=>{
        move(IPC.Directions.rightdown,done);
    });

    xit('ptz-move-righttop',(done)=>{
        move(IPC.Directions.righttop,done);
    });

    xit('ptz-move-leftdown',(done)=>{
        move(IPC.Directions.leftdown,done);
    });

    xit('zoomin',(done)=>{
        let ipc=new DHIPC(jIPCDemo);
        ipc.zoomIn().then().catch(done);
        setTimeout(()=>{
            ipc.ptzStop().then(done).catch(done);
            done();
        },400);
    });

    xit('zoomout',(done)=>{
        let ipc=new DHIPC(jIPCDemo);
        ipc.zoomOut().then().catch(done);
        setTimeout(()=>{
            ipc.ptzStop().then(done).catch(done);
        },400);
    });

    xit('focusIn',(done)=>{
        let ipc=new DHIPC(jIPCDemo);
        ipc.focusIn().then().catch(done);
        setTimeout(()=>{
            ipc.ptzStop().then(done).catch(done);
        },400);
    });

    xit('focusOut',(done)=>{
        let ipc=new DHIPC(jIPCDemo);
        ipc.focusOut().then().catch(done);
        setTimeout(()=>{
            done();//ipc.ptzStop().then(done).catch(done);
        },4000);
    });

    xit('apertureIn',(done)=>{
        let ipc=new DHIPC(jIPCDemo);
        ipc.apertureIn().then().catch(done);
        setTimeout(()=>{
            ipc.ptzStop().then(done).catch(done);
        },400);
    });

    xit('apertureOut',(done)=>{
        let ipc=new DHIPC(jIPCDemo);
        ipc.apertureOut().then().catch(done);
        setTimeout(()=>{
            ipc.ptzStop().then(done).catch(done);
        },400);
    });

    xit('getPoint',(done)=>{
        let ipc=new DHIPC(jIPCDemo);
        ipc.getPoint().then((data)=>{
            console.log(data);
            done();
        }).catch(done);
    });

    xit('getNextPresets',(done)=>{
        let ipc=new DHIPC(jIPCDemo);
        ipc.getNextPresets().then((data)=>{
            console.log(data);
            done();
        }).catch(done);
    });

    xit('设置预置点',(done)=>{
        let ipc=new DHIPC(jIPCDemo);
        ipc.setPreset('hello').then((p)=>{
            console.log(p);
            done();
        }).catch(done);
    });

    xit('移动到预置位-通过预留点',(done)=>{
        //{ x: 1320, y: 264, z: 6, preset: 6 }
        let ipc=new DHIPC(jIPCDemo);
        ipc.moveToPreset({ x: 1320, y: 264, z: 6, preset: 6 }).then(()=>{done()}).catch(done);
    });

    xit('移动到预置位-通过点位',(done)=>{
        //{ x: 1320, y: 264, z: 6, preset: 6 }
        let ipc=new DHIPC(jIPCDemo);
        ipc.moveToPreset({ x: 1320, y: 264, z: 6}).then(()=>{
            setTimeout(done,0);
        }).catch(done);

    });

    xit('报警输出',(done)=>{
        let ipc=new DHIPC(jIPCDemo);
        ipc.alarm().then(()=>{
            setTimeout(()=>{
                ipc.stopAlarm().then(done).catch(done);
            },2000);
        }).catch(done);
    });

    xit('音频设置',(done)=>{
        let ipc=new DHIPC(jIPCDemo);
        ipc.connect().then(()=>{
            ipc._talkInit().then(done).catch(done);
        });
    });

    it('talk——talk',(done)=>{
        let ipc=new DHIPC(jIPCDemo);
        let fw=fs.createWriteStream('d:/dhipc_audio.aac',wOption);
        ipc._startTalk(fw).then(()=>{
            setTimeout(()=> {
                fw.close();
                done();
            },20000);
        }).catch(done);
    });

});