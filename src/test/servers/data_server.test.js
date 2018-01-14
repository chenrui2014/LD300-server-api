const {db,file}=require('../init');
const expect=require('chai').expect;
const Data=require('../../servers/data_server');

describe('监控测试',()=> {
    let dbInstance = null;
    let hostID=1;
    before(async () => {
        //打开注释启动数据库取数据
        dbInstance = await db();
    });

    it('获取监控位置的摄像头',async ()=>{
        let ipcs=await Data.getMointors(hostID,300);
        expect(!ipcs).equal(false);
    });
});