let config=require('../../../app/config/config');
config.runMode.type='one';
const StartUp=require('../../../app/servers/startup');
const vHost=require('../../host/virtual_host');

let s=null,vh=null;
let before=()=>{
    s=new StartUp();
    vh=new vHost(1);
    return Promise.all([vh.start(),s.start()]);
};

let after=()=>{
    s.stop();
    console.log('结束了');
    process.exit();
};

let run= ()=>{
    setInterval(()=>{
        vh.send(vHost.CMD.normal);
    },400);
};

before().then(run);
setTimeout(after,15000);