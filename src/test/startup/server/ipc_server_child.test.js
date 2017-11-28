const Server=require('../../../servers/ipc_server_child');
const {db,file}=require('../../init');

describe('ipc_server_child服务测试',()=>{
    it('启动',async ()=>{
        let connection=await db();
        await new Promise((resolve)=>{
            setTimeout(resolve,100000000);
        });
        return await connection.close();
    });
});