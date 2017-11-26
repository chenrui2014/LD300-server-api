const init=require('../../init');
const StartUp=require('../../../servers/startup');
const vHost=require('../../host/virtual_host');
const _=require('lodash');

let s=null,vh=null;
let before=async ()=>{
    await init();
    s=new StartUp();
    vh=new vHost(1);
    await Promise.all([vh.start(),s.start()]);
};

let after=()=>{
    s.stop();
    console.log('结束了');
    process.exit();
};

let run= ()=>{
    setInterval(()=>{
        let r=_.random(0,1,false);
        r===0?vh.send(vHost.CMD.normal):vh.send(vHost.CMD.alarm,100);
    },400);
};

before().then(run);
//setTimeout(after,15000);