/**
 * Created by Luky on 2017/7/11.
 */

const _508PTZ=require('../../ipcs/_508/_508_ptz');
const _V508=require('./v_508');
const expect=require('chai').expect;

describe('基础代码测试',()=>{
    let _508,_v508;
    before((done)=>{
        _508=new _508PTZ({port:'\\\\.\\COM1',auto_close:0});
        _v508=new _V508('\\\\.\\COM2');
        _v508.run((err)=>{
            expect(!err).equal(true);
            done();
            //_v508.stop(done);
        });
    });

    describe('链接测试',()=>{
        it('连接关闭设备',async ()=>{
            await _508.connect();
            expect(_508.isConnected).equal(true);
            await _508.disConnect();
            expect(_508.isConnected).equal(false);
        });
    });

    describe('镜头功能性测试',()=>{
        it('变焦测试+',async ()=>{
            console.log('测试命令zoomAdd');
            let cmd=await _508.zoomAdd();
            expect(cmd.equals(Buffer.from([0xa2,0x00,0x09,0x56,0x41,0x00,0x00,0xBC,0xAF]))).equal(true);
            //a20009564100bcaf
        });
        it('变焦测试-',async ()=>{
            console.log('测试命令zoomDec');
            let cmd=await _508.zoomDec();
            expect(cmd.equals(Buffer.from([0xa2,0x00,0x09,0x56,0x4d,0x00,0x00,0xB0,0xAF]))).equal(true);
        });
        it('变焦测试-=',async ()=>{
            console.log('测试命令zoomDec-ptzStop');
            let cmd=await _508.zoomDec(true);
            expect(cmd.equals(Buffer.from([0xa2,0x00,0x09,0x56,0x4d,0x00,0x00,0xB0,0xAF]))).equal(true);
        });
        it('变焦测试=，返回z值',async ()=>{
            console.log('测试命令_zoomStop');
            let cmd=await _508._zoomStop();
            expect(cmd.equals(Buffer.from([0xa2,0x00,0x09,0x56,0x53,0x00,0x00,0xAE,0xAF]))).equal(true);
        });
        it('聚焦测试+',async ()=>{
            console.log('测试命令focusAdd');
            let cmd=await _508.focusAdd();
            expect(cmd.slice(0,5).equals(Buffer.from([0xa2,0x00,0x09,0x46,0x41]))).equal(true);
        });
        it('聚焦测试-',async ()=>{
            console.log('测试命令focusDec');
            let cmd=await _508.focusDec();
            expect(cmd.slice(0,5).equals(Buffer.from([0xa2,0x00,0x09,0x46,0x4D]))).equal(true);
        });
        it('聚焦测试-=',async ()=>{
            console.log('测试命令focusDec-ptzStop');
            let cmd=await _508.focusDec(true);
            expect(cmd.slice(0,5).equals(Buffer.from([0xa2,0x00,0x09,0x46,0x4D]))).equal(true);
        });
        it('聚焦测试=',async ()=>{
            console.log('测试命令focusStop');
            let cmd=await _508._focusStop(true);
            expect(cmd.equals(Buffer.from([0xa2,0x00,0x09,0x46,0x53,0x00,0x00,0xBE,0xAF]))).equal(true);
        });
        it('光圈+',async ()=>{
            console.log('测试命令apertureAdd');
            let cmd=await _508.apertureAdd();
            expect(cmd.equals(Buffer.from([0xa2,0x00,0x09,0x49,0x41,0x00,0x00,0xA3,0xAF]))).equal(true);
        });
        it('光圈-',async ()=>{
            console.log('测试命令apertureDec');
            let cmd=await _508.apertureDec();
            expect(cmd.equals(Buffer.from([0xa2,0x00,0x09,0x49,0x4d,0x00,0x00,0xAF,0xAF]))).equal(true);
        });
        it('光圈-=',async ()=>{
            console.log('测试命令apertureDec-ptzStop');
            let cmd=await _508.apertureDec(true);
            expect(cmd.equals(Buffer.from([0xa2,0x00,0x09,0x49,0x4d,0x00,0x00,0xAF,0xAF]))).equal(true);
        });
        it('光圈=',async ()=>{
            console.log('测试命令apertureStop');
            let cmd=await _508._apertureStop(true);
            expect(cmd.equals(Buffer.from([0xa2,0x00,0x09,0x49,0x53,0x00,0x00,0xB1,0xAF]))).equal(true);
        });
        it('自动聚焦测试+',async ()=>{
            console.log('测试命令_focusAuto');
            await _508._focusAuto();
        });
    });

    describe('转台功能',()=>{

        it('查询位置',async ()=>{
            console.log('测试命令getPoint');
            let xyz=await _508.getPoint();
            console.log(`x:${xyz.x},y:${xyz.y},z:${xyz.z}`);
        });
        //'top':1,'down':2,'left':4,'right':8,
        it('转台移动-左',async ()=>{
            console.log('测试命令move');
            await _508.move(4);
        });
        it('转台移动-右',async ()=>{
            console.log('测试命令move');
            await _508.move(8);
        });
        it('转台移动-上',async ()=>{
            console.log('测试命令move');
            await _508.move(1);
        });
        it('转台移动-下',async ()=>{
            console.log('测试命令move');
            await _508.move(2);
        });
        it('转台移动-右-停止移动',async ()=>{
            console.log('测试命令move-ptzStop');
            await _508.move(4,true);
        });
        it('变焦到指定尺寸测试',async ()=>{
            console.log('测试命令_zoomTo');
            await _508._zoomTo(100);
        });
        it('转台转动到指定位置',async ()=>{
            console.log('测试命令moveToPoint');
            await _508.moveToPoint(1,1,1);
        });
    });

    after((done)=>{
        _v508.stop(done);
    });
});