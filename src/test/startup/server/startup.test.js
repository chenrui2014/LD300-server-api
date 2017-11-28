const {db,file}=require('../../init');
const StartUp=require('../../../servers/startup');
const vHost=require('../../host/virtual_host');
const _=require('lodash');
process.debugPort=9600;

let s=null,vh=null;
let dbInstance=null;

let before=async ()=>{
    //打开注释启动数据库取数据
    //dbInstance=await db();
    s=new StartUp();
    vh=new vHost(1);
    await Promise.all([vh.start(),s.start()]);
};

let after=async ()=>{
    if(dbInstance)await  dbInstance.close();
    s.stop();
    console.log('结束了');
    process.exit();
};

let run= ()=>{
    setInterval(()=>{
        let r=_.random(0,1,false);
        r===0?vh.send(vHost.CMD.normal):vh.send(vHost.CMD.alarm,100);
    },40000);
};

before().then(run);
//setTimeout(after,15000);