/**
 * Created by Luky on 2017/9/4.
 */

//import 'babel-polyfill';
//import connect from '../db';
const connect =require('../db/index');
const http = require('http');
const _=require('lodash');
const Live=require('./ipc_live_server');
const getPort=require('get-port');
const IPCFactory=require('./ipc_factory');
const crypto=require('crypto');
const config=global.server_config||require('../config/config');
const ptzLock=_.get(config,'ipc.ptzLock',15000);
const url=require('url');
const logger={};
const {Parser}=require('../log/log');
let port=0;

let send=function (data){
    if(process.send){
        return process.send(data);
    }
    logger.log('向主进程同步信号',{data});
};

const ptzFun=[
    'ptzStop',
    'zoomAdd',
    'zoomDec',
    'focusAdd',
    'focusDec',
    'apertureAdd',
    'apertureDec',
    'move'
];

let lives={length:0};

async function getLive(id) {
    let l=lives[id];
    if(l) return l;
    let ipc=await IPCFactory.getIPC(id).catch( ()=>{
        logger.warn('请求的摄像头不存在',{id:id});
        return null;
    });
    if(!ipc)return null;
    return lives[id]=new Live(server,ipc,'',{autoClose:true});
}

function fault(res,fn,desc,param,warn=true) {
    let msg=_.extend({type:'fault',fn},param);
    res.end(JSON.stringify(warn?logger.warn(desc,msg):logger.error(desc,msg)));
}

function succeed(res,fn,param,desc) {
    let msg=_.extend({type:'succeed',fn},param);
    res.end(JSON.stringify(logger.log(desc,msg)));
}

async function  play(res,id) {
    logger.log('收到播放请求',{id:id,fn:'live'});
    let l=await getLive(id);
    if(!l){
        return fault(res,'live','请求的摄像头不存在',{id});
    }
    if(l.running) {
        return succeed(res,'live',{port:port,path:l.path,id});
    }
    l.openWSS().then((ok)=>{
        if(!ok){
            return fault(res,'live','获取直播流错误',{id},false);
        }
        l.on('close',()=>{
            lives[id]=null;
            send({type:'countChanged',count:--lives.length});
        });
        send({type:'countChanged',count:++lives.length});
        return succeed(res,'live',{port:port,path:l.path,id});
    })
}

async function arrchive(res,id,hid) {
    logger.log('收到存档请求',{id,hid,fn:'arrchive'});
    let l=await getLive(id);
    if(!l) return fault(res,'arrchive','请求的摄像头不存在',{id,hid});
    l.arrchive(hid).then((path)=>{
        return path?succeed(res,'arrchive',{id,hid,path}):fault(res,'arrchive','发生内部错误，无法存档视频流或无法打开视频流',{id,hid},false);
    });
}

function stopArrchive(res,id) {
    logger.log('收到存档终止请求',{id,fn:'stopArrchive'});
    let l= lives[id];
    if(!l) return fault(res,'stopArrchive','请求的摄像头不存在',{id});
    l.stopArrchive(id);
    return succeed(res,'stopArrchive',{id});
}

async function ptz(res,id,fun,params){
    logger.log('收到ptz申请',{id,fn:'ptz',op:fun});
    params=params||{};
    const force=!!params.force;
    const stop=params.stop!=='0';
    let handle=params.handle;
    if(_.findIndex(ptzFun,(item)=>{return fun===item;})===-1) {
        return fault(res,'ptz','错误的PTZ命令',{op:fun});
    }
    let ipc=await IPCFactory.getIPC(id).catch(()=>{
        return Promise.resolve(null);
    });
    if(!ipc){
        return fault(res,'ptz','请求的摄像头不存在',{id});
    }
    ipc.ptz=ipc.ptz||{};
    const now=new Date().getTime();
    if(!ipc.ptz.handle||force||(ipc.ptz.handle!==handle&&now-ipc.ptz.lastTime>ptzLock)){
        ipc.ptz.handle=handle=createID();
    }
    else if(ipc.ptz.handle!==handle){
        return fault(res,'ptz','ptz暂时由其他人控制中，请等待',{id});
    }
    ipc.ptz.lastTime=now;
    let promise=fun==='move'?ipc[fun].apply(ipc,[parseInt(params.position)||1,stop]):ipc[fun].apply(ipc,[stop]);
    promise.then(()=>{
        succeed(res,'ptz',{handle,id,op:fun,limit:ptzLock})
    }).catch(e=>{
        ipc.ptz.handle=null;
        return fault(res,'ptz','内部处理异常',{id,op:fun,innerError:e},false);
    });
}

/*
applyMic(id){}
releaseMic(handle,id){}
sendMic(id,data){}
*/

async function freePTZ(res,id,params) {
    params=params||{};
    let handle=params.handle;
    logger.log('收到ptz释放申请',{id,fn:'freePTZ',handle});
    if(!handle){
        return fault(res,'freePTZ','不具备PTZ的控制权',{id});
    }
    let ipc=await IPCFactory.getIPC(id).catch(()=>{
        return Promise.resolve(null);
    });
    if(!ipc)return fault(res,'freePTZ','请求的摄像头不存在',{id});
    if(handle===ipc.ptz.handle){
        ipc.ptz.handle='';
        return succeed(res,'freePTZ',{id,handle});
    }
    return fault(res,'freePTZ','不具备PTZ的控制权',{id,handle});
}

const server=http.createServer();
/*server.on('upgrade', (req, socket, head) => {
    console.log('upgrade');
});*/

server.on('request',(req,res)=>{
    let uri=url.parse(req.url,true);
    let paths=_.trim(uri.pathname,'/').split('/').concat(['','','','']);
    if(paths[0]!=='ipc') {
        logger.warn('未知的请求',{uri});
        return;
    }
    logger.log('收到请求',{uri});
    //res.setHeader('Connection','Upgrade');
    //res.setHeader('Upgrade','websocket');
    res.setHeader('Content-Type','application/json; charset=utf-8');
    res.setHeader('Access-Control-Allow-Origin','*');
    res.setHeader("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With");
    res.setHeader("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.setHeader("X-Powered-By",' 3.2.1');
    let id=paths[1]-0;
    let fun=paths[2];
    let index;
    if((index=['live','stoparrchive','ptz','freeptz','arrchive'].indexOf(_.toLower(fun)))===-1){
        res.statusCode = 404;
        return res.end();
    }
    if(index===0){
        return play(res,id);
    }
    if(index===1){
        return stopArrchive(res,id);
    }
    if(index===2){
        //ptz/id/ptz/zoomAdd?position
        return ptz(res,id,paths[3],uri.query);
    }
    if(index===3){
        return freePTZ(res,id,uri.query);
    }
    if(index===4){
        return arrchive(res,id,paths[3]);
    }

    logger.warn('未知的方法请求',{fun,uri});
});

async function listen() {
    let _port=await getPort();
    server.listen(_port);
    port=_port;
}

server.on('listening',()=>{
    connect();
    Parser(logger,'ipc_server_child.js',{port:server.address().port});
    logger.log('摄像头直播流进程启动',{processID:process.pid,port:port});
    send({type:'listening',port:port});
});

server.on('error',(err)=>{
    if(err.code==='EACCES'||err.code==='EADDRINUSE'){
        listen();
    }
    console.error({source:'ipc_server_child.js',desc:err.toString()});
});

listen().catch();

function createID() {
    const hash = crypto.createHash('md5');
    hash.update(new Date().getTime().toString());
    return hash.digest('hex');
}

exports=module.exports={
    server
};