/**
 * Created by Luky on 2017/7/2.
 */
const DHNVR=require('../../app/ipcs/dahua/_dh_nvr');
const jIPC=require('../data/_dhnvr.json');
const expect = require('chai').expect;

describe('大华nvr测试', function() {
    xit('nvr连接测试',function(done){
        let ipc=new DHNVR(jIPC);
        ipc.connect((err)=>{
            expect(!err).equal(true);
            expect(ipc.isConnected).equal(true);
            ipc.disConnect(done);
        });
    });
    it('视频流测试',function(done){
        let ipc=new DHNVR(jIPC);
        ipc._realPlay((err,id/*,code,buf,size*/)=>{
            expect(!err).equal(true);
            console.log('接受到数据');
        });
        setTimeout(()=>{
            ipc._stopRealPlay((err)=>{
                expect(!err).equal(true);
                ipc.disConnect(done);
            });
        },2000);
    });
});