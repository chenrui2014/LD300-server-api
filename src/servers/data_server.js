/**
 * Created by Luky on 2017/8/17.
 */

import HostService from '../services/hostService';
import MonitoringService from '../services/monitoringService';
import PresetService from '../services/PresetService';
import CameraService from '../services/cameraService';

const _=require('lodash');
const config=global.server_config||require('../config/config');
const store=_.get(config,'runMode.store','db');

if(store==='file'){
    exports=module.exports=require('./data_server_file');
}
else{
    //数据格式[{id,port},{...},...]
    async function getHosts()
    {
        //查询出所有的主机信息
        return await HostService.findAll();
    }

    //数据格式[{id,demo,alarm,screenshot,audio,min,max,presets:[{x,y,z,distance},{...},...]},{...},...]
    //id,demo,alarm,screenshot,audio,min,max从MonitoringAreaSchema筛选后通过transformIPC转换
    //presets为PresetSchema数据
    //查询结果为监控distance位置摄像头的配置信息
    async function getMointors(hostID,distance){
        //MonitoringAreaSchema条件 hostid==host && min<=distance&&distance<=max
        let monitorArea = {};
        const monitors = await MonitoringService.find_monitoringArea({hostId:hostID,min:{$lte:distance},max:{$gte:distance}});//获得监控区域
        monitorArea.id = hostID;
        monitorArea.monitors = monitors;

        monitors.forEach(async function (monitor) {
            const camera = await CameraService.find_one(monitors.cameraId);//获得关联摄像头
            const presets = await PresetService.find_preset({monitorId:monitor.id});
            let m = {id:camera.id,demo:camera.ptz,alarm:camera.alarm,audio:camera.audio,min:monitor.min,max:monitor.max};
            m.presets = presets;
            monitorArea.monitors = m;
        });

        return monitorArea;
    }

    function transformIPC(ipc) {
        return {
            id:ipc.id,
            ip:ipc.ip,
            port:ipc.port,
            user:ipc.user,
            pwd:ipc.pwd,
            brand:ipc.brand,
            functions:{
                ptz:ipc.ptz,
                alarm:ipc.alarm,
                audio:ipc.audio
            },
            onvif:{
                user:ipc.onvif_user,
                    pwd:ipc.onvif_pwd,
                    port:ipc.onvif_port,
                    path:ipc.onvif_path
            }
        };
    }

    //数据格式transformIPC
    async function getIPC(id){
        let ipc= await null;//实现
        if(!ipc) await Promise.reject();
        return transformIPC(ipc);
    }

    //数据格式[1,2,3,4,5]
    function getIPCIDsSortByPoint(){
        //查询出所有摄像头的编号返回即可，根据摄像头的编号排序基本没问题
        return [1,2,3,4,5];
    }

    exports=module.exports={
        getHosts:getHosts,
        getMointors:getMointors,
        getIPC:getIPC,
        getIPCIDsSortByPoint:getIPCIDsSortByPoint
    };
}