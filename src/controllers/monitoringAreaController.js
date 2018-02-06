/**
 * Created by chen on 17-8-23.
 */
const {Parser}=require('../log/log');
const logger={};
Parser(logger,'MonitoringAreaController.js');
import MonitoringService from '../services/monitoringService';
import HostService from '../services/hostService';
import CameraService from '../services/cameraService';
//import CameraTypeService from "../services/cameraTypeService";

class MonitoringAreaController {
    static async add_monitoringArea(ctx){
        const data = ctx.request.body;
        logger.info(data);
        if(!data) return ctx.body={ msg: '发送数据失败!' };
        //const isExit = await MonitoringService.isExist(id).add_monitoringArea(data).findOne({ip:data.fields.ip});
        //logger.info(isExit);
        //if(isExit) return ctx.body={ msg: '该监控区域已添加!' };

        const result = await MonitoringService.add_monitoringArea(data);
        let msg = '';
        if(result) {
            msg = '添加监控区域成功';
            return ctx.body = {msg:msg,data:data};
        }else{
            msg = '添加监控区域失败';
            return ctx.error={msg: msg};
        }
    }

    static async delete_monitoringArea(ctx) {
        const { id } = ctx.params;
        logger.info(id);
        const result = await MonitoringService.delete_monitoringArea({id:id});
        let msg = '';
        if(result) {
            msg = '删除摄像头成功';
            return ctx.body = {msg:msg,data:result};
        }else{
            msg = '删除摄像头失败';
            return ctx.error={msg: msg};
        }
    }

    static async edit_monitoringArea(ctx){
        const data = ctx.request.body;
        logger.info(data);
        let _id = data._id;
        delete data._id;
        const result = await MonitoringService.edit_monitoringArea({_id:_id},data);
        if(result) ctx.body = {msg:'修改监控区域成功',data:result};
        return ctx.error={msg: '修改监控区域失败!'};
    }

    static async find_monitoringArea(ctx){
        const { sort,range,filter } = ctx.query;
        // let sortObj = JSON.parse(sort);
        // let rangeObj = JSON.parse(range);
        // let filterObj = JSON.parse(filter);
        let sortObj = null;
        if(sort){
            sortObj = JSON.parse(sort);
        }

        let rangeObj = null;
        if(range){
            rangeObj = JSON.parse(range);
        }

        let filterObj = null;
        if(filter && "{}" !==filter){
            let obj = JSON.parse(filter);
            if(obj && Array.isArray(obj.id)){
                filterObj = {id:{$in:obj.id}};
            }else{
                filterObj = obj;
            }
        }
        let sortP = {};
        if(sortObj && sortObj.length >=2){
            if('ASC' ===sortObj[1]){
                sortP[sortObj[0]] = 1;
            }else{
                sortP[sortObj[0]] = -1;
            }
        }

        let pageStart = 0,pageEnd = 0;
        if(rangeObj && rangeObj.length >=2){
            pageStart = rangeObj[0];
            pageEnd = rangeObj[1];
        }


        const total = await MonitoringService.getTotal();

        const pagination = {};
        pagination.pageStart = pageStart;
        pagination.pageSize = pageEnd-pageStart+1;

        let result = null;
        if(sortP){
            if(rangeObj){
                let pageStart = 0,pageEnd = 0;
                if(rangeObj && rangeObj.length >=2){
                    pageStart = rangeObj[0];
                    pageEnd = rangeObj[1];
                }
                const pagination = {};
                pagination.pageStart = pageStart;
                pagination.pageSize = pageEnd-pageStart+25;
                result = await MonitoringService.find_monitoringArea(filterObj,sortP,pagination);
            }else{
                result = await MonitoringService.find_monitoringArea(filterObj,sortP);
            }
        }else{
            if(rangeObj){
                let pageStart = 0,pageEnd = 0;
                if(rangeObj && rangeObj.length >=2){
                    pageStart = rangeObj[0];
                    pageEnd = rangeObj[1];
                }
                const pagination = {};
                pagination.pageStart = pageStart;
                pagination.pageSize = pageEnd-pageStart+25;
                result = await MonitoringService.find_monitoringArea(filterObj,null,pagination);
            }else{
                result = await MonitoringService.find_monitoringArea(filterObj);
            }
        }

        // let result = await MonitoringService.find_monitoringArea(filterObj,sortP,pagination);
        // const hosts = await HostService.findAll();
        //
        // result.forEach(function (e) {
        //     hosts.forEach(function (host) {
        //         if(e._doc.hostId === host._doc.id) e._doc.hostName = host._doc.hostName;
        //         return;
        //     });
        // });
        // const cameras = await CameraService.findAll();
        //
        // result.forEach(function (e) {
        //     cameras.forEach(function (camera) {
        //         if(e._doc.cameraId === camera._doc.id) e._doc.cameraName = camera._doc.name;
        //         return;
        //     });
        // });
        if(result) return ctx.body = {msg:'查询监控区域',data:result,total:total};
        return ctx.body={msg: '没有找到监控区域!'};
    }

    static async find_monitoringArea_noPage(ctx){
        const { sort} = ctx.query;
        let sortObj = JSON.parse(sort);
        let sortP = {};
        if(sortObj && sortObj.length >=2){
            if('ASC' ===sortObj[1]){
                sortP[sortObj[0]] = 1
            }else{
                sortP[sortObj[0]] = -1
            }
        }
        let result = await MonitoringService.findAll(sortP);
        const hosts = await HostService.findAll();

        result.forEach(function (e) {
            hosts.forEach(function (host) {
                if(e._doc.hostId === host._doc.id) e._doc.hostName = host._doc.hostName;
                //return;
            });
        });
        const cameras = await CameraService.findAll();

        result.forEach(function (e) {
            cameras.forEach(function (camera) {
                if(e._doc.cameraId === camera._doc.id) e._doc.cameraName = camera._doc.name;
                //return;
            });
        });
        if(result) return ctx.body = {msg:'查询监控区域',data:result};
        return ctx.error={msg: '没有找到监控区域!'};
    }
    static async find_one(ctx){
        const { id } = ctx.params;
        const result = await MonitoringService.find_one(id);
        const hosts = await HostService.findAll();

        hosts.forEach(function (host) {
                if(result._doc.hostId === host._doc.id) result._doc.hostName = host._doc.hostName;
                //return;
        });

        const cameras = await CameraService.findAll();

        cameras.forEach(function (camera) {
                if(result._doc.cameraId === camera._doc.id) result._doc.cameraName = camera._doc.name;
                //return;
        });

        if(result) return ctx.body = {msg:'查询监控区域',data:result};
        return ctx.body = {msg: '没有找到监控区域!'};
    }

}

export default MonitoringAreaController;