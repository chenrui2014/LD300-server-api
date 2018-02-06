/**
 * Created by chen on 17-8-23.
 */
const {Parser}=require('../log/log');
const logger={};
Parser(logger,'CameraController.js');
import CameraService from '../services/cameraService';

class CameraController {
    static async add_camera(ctx){
        const data = ctx.request.body;
        logger.info(data);

        if(!data) return ctx.error={ msg: '发送数据失败!' };
        //const isExist = await CameraService.isExist({ip:data.ip})
        //const isExist = await CameraModel.findOne({ip:data.ip});

        //if(isExist) return ctx.error={ msg: 'ip为[' + data.ip + ']的摄像头ip已存在!' };

        const result = await CameraService.add_camera(data)

        let msg = '';
        if(result) {
            msg = '添加摄像头'+ data.ip +'成功';
            return ctx.body = {msg:msg,data:data};
        }else{
            msg = '添加失败';
            return ctx.error={msg: msg};
        }

    }

    static async delete_camera(ctx) {
        const { id } = ctx.params;
        const result = await CameraService.delete_camera({id:id})
        let msg = '';
        if(result) {
            msg = '删除摄像头成功';
            return ctx.body = {msg:msg,data:result};
        }else{
            msg = '删除摄像头失败';
            return ctx.error={msg: msg};
        }

    }

    static async edit_camera(ctx){
        const data = ctx.request.body;
        logger.info(data);
        let _id = data._id;
        delete data._id;
        const result = await CameraService.edit_camera({_id:_id},data);
        if(result) return ctx.body = {msg:'修改摄像头成功',data:result};
        return ctx.error={msg: '修改摄像头失败!'};
    }

    static async find_camera(ctx){
        const { sort,range,filter } = ctx.query;
        let sortObj = JSON.parse(sort);
        let rangeObj = JSON.parse(range);
        let filterObj = JSON.parse(filter);
        let sortP = {};
        if(sortObj && sortObj.length >=2){
            if('ASC' ===sortObj[1]){
                sortP[sortObj[0]] = 1
            }else{
                sortP[sortObj[0]] = -1
            }
        }

        let pageStart = 0,pageEnd = 0
        if(rangeObj && rangeObj.length >=2){
            pageStart = rangeObj[0];
            pageEnd = rangeObj[1];
        }

        const total = await CameraService.getTotal();

        const pagination = {};
        pagination.pageStart = pageStart;
        pagination.pageSize = pageEnd-pageStart+1;

        let result = await CameraService.find_camera(filterObj,sortP,pagination);
        if(result) return ctx.body = {msg:'查询摄像头',data:result,total:total};
        return ctx.error={msg: '没有找到摄像头!'};
    }

    static async find_camera_noPage(ctx){
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
        let result = await CameraService.findAll(sortP);
        if(result) return ctx.body = {msg:'查询摄像头',data:result};
        return ctx.error={msg: '没有找到摄像头!'};
    }

    static async find_one(ctx){
        const { id } = ctx.params;
        const result = await CameraService.find_one(id);
        if(result) ctx.body = {msg:'查询摄像头',data:result};
        return ctx.error = {msg: '没有找到摄像头!'};
    }

}

export default CameraController;