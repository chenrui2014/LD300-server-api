/**
 * Created by chen on 17-8-23.
 */
import logger from '../logger';

import CamerasService from '../services/camerasService';
import HostService from "../services/hostService";

class CamerasController {
    static async add_cameras(ctx){
        const data = ctx.request.body;
        logger.info(data);

        if(!data) return ctx.error={ msg: '发送数据失败!' };
        //const isExist = await CamerasService.isExist({ip:data.ip})
        //const isExist = await CamerasModel.findOne({ip:data.ip});

        //if(isExist) return ctx.error={ msg: 'ip为[' + data.ip + ']的摄像头ip已存在!' };

        const result = await CamerasService.add_cameras(data)

        let msg = '';
        if(result) {
            msg = '添加摄像头'+ data.ip +'成功';
            return ctx.body = {msg:msg,data:data};
        }else{
            msg = '添加失败';
            return ctx.error={msg: msg};
        }

    }

    static async delete_cameras(ctx) {
        const { id } = ctx.params;
        const result = await CamerasService.delete_cameras({id:id})
        let msg = '';
        if(result) {
            msg = '删除摄像头成功';
            return ctx.body = {msg:msg,data:result};
        }else{
            msg = '删除摄像头失败';
            return ctx.error={msg: msg};
        }

    }

    static async edit_cameras(ctx){
        const data = ctx.request.body;
        logger.info(data);
        let _id = data._id;
        delete data._id;
        const result = await CamerasService.edit_cameras({_id:_id},data);
        if(result) return ctx.body = {msg:'修改摄像头成功',data:result};
        return ctx.error={msg: '修改摄像头失败!'};
    }

    static async find_cameras(ctx){
        const { sort,range,filter } = ctx.query;
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

        const total = await CamerasService.getTotal();

        const pagination = {};
        pagination.pageStart = pageStart;
        pagination.pageSize = pageEnd-pageStart+1;
        let result = null;
        if(sortP){
            if(rangeObj){
                let pageStart = 0,pageEnd = 0
                if(rangeObj && rangeObj.length >=2){
                    pageStart = rangeObj[0];
                    pageEnd = rangeObj[1];
                }
                const pagination = {};
                pagination.pageStart = pageStart;
                pagination.pageSize = pageEnd-pageStart+25;
                result = await CamerasService.find_cameras(filterObj,sortP,pagination);
            }else{
                result = await CamerasService.find_cameras(filterObj,sortP);
            }
        }else{
            if(rangeObj){
                let pageStart = 0,pageEnd = 0
                if(rangeObj && rangeObj.length >=2){
                    pageStart = rangeObj[0];
                    pageEnd = rangeObj[1];
                }
                const pagination = {};
                pagination.pageStart = pageStart;
                pagination.pageSize = pageEnd-pageStart+25;
                result = await CamerasService.find_cameras(filterObj,null,pagination);
            }else{
                result = await CamerasService.find_cameras(filterObj);
            }
        }
        // let result = await CamerasService.find_cameras(filterObj,sortP,pagination);
        if(result) return ctx.body = {msg:'查询摄像头',data:result,total:total};
        return ctx.error={msg: '没有找到摄像头!'};
    }

    static async find_cameras_noPage(ctx){
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
        let result = await CamerasService.find_cameras(null,sortP,null);
        if(result) return ctx.body = {msg:'查询摄像头',data:result};
        return ctx.error={msg: '没有找到摄像头!'};
    }

    static async find_one(ctx){
        const { id } = ctx.params;
        const result = await CamerasService.find_one(id);
        if(result) ctx.body = {msg:'查询摄像头',data:result};
        return ctx.error = {msg: '没有找到摄像头!'};
    }

    static async find_preset(ctx){
        const {camera_id} = ctx.params;
        const result = await CamerasService.find_one(id);
        if(result) return ctx.body = {msg:'查询摄像头',data:result.preset};
        return ctx.error={msg: '该摄像头没有预置点!'};
    }

}

export default CamerasController;