/**
 * Created by Luky on 2017/7/2.
 */
require('../modify_config');
const DHIPC=require('../../ipcs/dahua/dh_ipc');
const Data=require('../../servers/data_server');
const expect = require('chai').expect;
const IPC=require('../../ipcs/base/ipc');
const fs=require('fs');
const wOption = {
    flags: 'w',
    encoding: null,
    fd: null,
    mode: 0o666,
    autoClose: true
};

async function getInstance(id) {
    return await new DHIPC(Data.getIPC(id));
}

describe('大华IPC直连测试', function() {
    it('连接测试',async function(done){
        let ipc=await getInstance(1);
        ipc.connect().then(()=>{
            console.log('链接成功');
            expect(ipc.isConnected).equal(true);
            ipc.disConnect().then(done).catch(done);
        }).catch(done);
    });

    it('视频流测试',async function(done){
        let ipc=await getInstance(1);
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

    async function move(d,done) {
        let ipc=await getInstance(5);
        ipc.move(d).then().catch(done);
        setTimeout(()=>{
            ipc.ptzStop().then(done).catch(done);
        },400);
    }

    it('ptz-move-up',async (done)=>{
        await move(IPC.Directions.top,done);
    });

    it('ptz-move-down',async (done)=>{
        await move(IPC.Directions.down,done);
    });

    it('ptz-move-left',async (done)=>{
        await move(IPC.Directions.left,done);
    });

    it('ptz-move-right',async (done)=>{
        await move(IPC.Directions.right,done);
    });

    it('ptz-move-topleft',async (done)=>{
        await move(IPC.Directions.lefttop,done);
    });

    it('ptz-move-rightdown',async (done)=>{
        await move(IPC.Directions.rightdown,done);
    });

    it('ptz-move-righttop',async (done)=>{
        await move(IPC.Directions.righttop,done);
    });

    it('ptz-move-leftdown',async(done)=>{
        await move(IPC.Directions.leftdown,done);
    });

    it('zoomin',async (done)=>{
        let ipc=await getInstance(5);
        ipc.zoomIn().then().catch(done);
        setTimeout(()=>{
            ipc.ptzStop().then(done).catch(done);
            done();
        },400);
    });

    it('zoomout',async (done)=>{
        let ipc=await getInstance(5);
        ipc.zoomOut().then().catch(done);
        setTimeout(()=>{
            ipc.ptzStop().then(done).catch(done);
        },400);
    });

    it('focusIn',async (done)=>{
        let ipc=await getInstance(5);
        ipc.focusIn().then().catch(done);
        setTimeout(()=>{
            ipc.ptzStop().then(done).catch(done);
        },400);
    });

    it('focusOut',async (done)=>{
        let ipc=await getInstance(5);
        ipc.focusOut().then().catch(done);
        setTimeout(()=>{
            done();//ipc.ptzStop().then(done).catch(done);
        },4000);
    });

    it('apertureIn',async (done)=>{
        let ipc=await getInstance(5);
        ipc.apertureIn().then().catch(done);
        setTimeout(()=>{
            ipc.ptzStop().then(done).catch(done);
        },400);
    });

    it('apertureOut',async (done)=>{
        let ipc=await getInstance(5);
        ipc.apertureOut().then().catch(done);
        setTimeout(()=>{
            ipc.ptzStop().then(done).catch(done);
        },400);
    });

    it('getPoint',async (done)=>{
        let ipc=await getInstance(5);
        ipc.getPoint().then((data)=>{
            console.log(data);
            done();
        }).catch(done);
    });

    it('getNextPresets',async (done)=>{
        let ipc=await getInstance(5);
        ipc.getNextPresets().then((data)=>{
            console.log(data);
            done();
        }).catch(done);
    });

    it('设置预置点',async (done)=>{
        let ipc=await getInstance(5);
        ipc.setPreset('hello').then((p)=>{
            console.log(p);
            done();
        }).catch(done);
    });

    it('移动到预置位-通过预留点',async (done)=>{
        //{ x: 1320, y: 264, z: 6, preset: 6 }
        let ipc=await getInstance(5);
        ipc.moveToPreset({ x: 1320, y: 264, z: 6, preset: 6 }).then(()=>{done()}).catch(done);
    });

    it('移动到预置位-通过点位',async (done)=>{
        //{ x: 1320, y: 264, z: 6, preset: 6 }
        let ipc=await getInstance(5);
        ipc.moveToPreset({ x: 1320, y: 264, z: 6}).then(()=>{
            setTimeout(done,0);
        }).catch(done);

    });

    it('报警输出',async (done)=>{
        let ipc=await getInstance(5);
        ipc.alarm().then(()=>{
            setTimeout(()=>{
                ipc.stopAlarm().then(done).catch(done);
            },2000);
        }).catch(done);
    });

    it('音频设置',async (done)=>{
        let ipc=await getInstance(5);
        ipc.connect().then(()=>{
            ipc._talkInit().then(done).catch(done);
        });
    });

    it('talk——talk',async (done)=>{
        let ipc=await getInstance(5);
        let fw=fs.createWriteStream('d:/dhipc_audio.aac',wOption);
        ipc._startTalk(fw).then(()=>{
            setTimeout(()=> {
                fw.close();
                done();
            },20000);
        }).catch(done);
    });

});