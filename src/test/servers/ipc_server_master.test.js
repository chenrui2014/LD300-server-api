const {db,file}=require('../init');
const http = require('http');
const IPCDispatch=require('../../servers/ipc_server_master');
const expect=require('chai').expect;

const port=3000;

async function send(path) {
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

describe('ipc分发服务测试',()=>{
    let dbInstance=null;
    let server=new IPCDispatch();
    before(async ()=>{
        //打开注释启动数据库取数据
        dbInstance=await file();
        await server.start({port});
    });
    it('测试同一个ipc的分发',async ()=>{
        await send('/ipc/6/live');
        await send('/ipc/6/live');
        await send('/ipc/6/live');
    });
    it('测试不同ipc的分发',async ()=>{
        await send('/ipc/6/live');
        await send('/ipc/6/live');
        await send('/ipc/1/live');
    })
});