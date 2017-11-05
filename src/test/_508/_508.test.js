/**
 * Created by Luky on 2017/7/11.
 */

const _508PTZ=require('../../app/ipcs/_508/_508_ptz');
const _V508=require('./v_508');
const expect=require('chai').expect;

describe('基础代码测试',()=>{
    let _508,_v508;
    before((done)=>{
        _508=new _508PTZ({ser_port:'\\\\.\\COM1'});
        _v508=new _V508('\\\\.\\COM2');
        _v508.run((err)=>{
            expect(!err).equal(true);
            done();
            //_v508.stop(done);
        });
    });

    xdescribe('链接测试',()=>{
        it('测试链接可用性',(done)=>{
            _508.connect().then(()=>{
                expect(_508.isConnected).equal(false);
                done();
            }).catch(done);
        });

        it('端口打开关闭分开测试',(done)=>{
            _508.connect(false).then(()=>{
                expect(_508.isConnected).equal(true);
                _508.disConnect().then(done).catch(done);
            }).catch(done);
        });
    });

    xdescribe('镜头功能性测试',()=>{
        it('变焦测试+',(done)=>{
            _508.zoomIn().then(done).catch(done);
        });
        it('变焦测试-',(done)=>{
            _508.zoomOut().then(done).catch(done);
        });
        it('变焦测试=',(done)=>{
            _508.ptzStop().then(done).catch(done);
        });
        it('聚焦测试+',(done)=>{
            _508.focusIn().then(done).catch(done);
        });
        it('聚焦测试-',(done)=>{
            _508.focusOut().then(done).catch(done);
        });
        it('聚焦测试=',(done)=>{
            _508.ptzStop().then(done).catch(done);
        });
        it('光圈+',(done)=>{
            _508.apertureIn().then(done).catch(done);
        });
        it('光圈-',(done)=>{
            _508.apertureOut().then(done).catch(done);
        });
        it('光圈=',(done)=>{
            _508.ptzStop().then(done).catch(done);
        });
        it('自动聚焦测试+',(done)=>{
            _508._focusAuto().then(done).catch(done);
        });
        it('变焦到指定尺寸测试',(done)=>{
            _508._zoomTo(100).then(done).catch(done);
        });
    });

    describe('转台功能',()=>{
        xit('查询位置',(done)=>{
            _508.getPoint().then((xyz)=>{
                console.log(`x:${xyz.x},y:${xyz.y},z:${xyz.z}`);
                done();
            }).catch(()=>{
                done();
            });
        });
        xit('转台移动',(done)=>{
            _508.move(4).then(done).catch(done);
        });
        xit('转台停止移动',(done)=>{
            _508.ptzStop(4).then(done).catch(done);
        });
        it('转台转动到指定位置',(done)=>{
            _508.moveToPoint(1,1,1).then(done).catch(done);
        });
    });

    after((done)=>{
        _v508.stop(done);
    });
});