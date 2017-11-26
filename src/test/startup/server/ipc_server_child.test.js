const Server=require('../../../servers/ipc_server_child');

describe('ipc_server_child服务测试',()=>{
    it('启动',(done)=>{
        setInterval(()=>{
            done;
        },300000);
    });
});