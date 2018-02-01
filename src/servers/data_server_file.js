/**
 * Created by Luky on 2017/10/22.
 */

let _=require('lodash');
const config=global.server_config||require('../config/config');
let hosts=config.getData('hosts_config.json');
let ipcs=config.getData('ipcs_config.json');
let mointors=config.getData('mointors_config.json');

async function getHosts()
{
    return hosts;
}

async function getMointors(hostID,distance){
    let m=_.find(mointors,(m)=>{return m.id===hostID})['mointors'];
    return  _.filter(m,(ipc)=>{
        return ipc.min<=distance&&ipc.max>=distance;
    });
}

async function getIPC(id){
    return _.find(ipcs,(ipc)=>{return ipc.id===id;});
}

async function  recordAlert() {
    return true;
}

async  function  recordAlertVideo() {
    return true;
}

async function getAllIPC() {
    return ipcs;
}

async  function transformIPC(ipc) {
    return ipc;
}

/*
async function getIPCIDsSortByPoint(){
    let ret=[];
    _.each(ipcs,(ipc)=>{
        ret.push(ipc.id);
    });
    return ret;
}*/

exports=module.exports={
    getHosts,
    getMointors,
    getIPC,
    getAllIPC,
    transformIPC,
    //getIPCIDsSortByPoint,
    recordAlert,
    recordAlertVideo
};