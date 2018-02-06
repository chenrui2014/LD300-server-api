/**
 * Created by chen on 17-8-23.
 */
const {Parser}=require('../log/log');
const logger={};
Parser(logger,'CameraTypeController.js');
import CameraTypeService from '../services/cameraTypeService';

class CameraTypeController {
    static async add_cameraType(ctx){
        const data = ctx.request.body;
        logger.info(data);

        if(!data) return ctx.error={ msg: '发送数据失败!' };
        const isExist = await CameraTypeService.isExist({typeCode:data.typeCode});
        //const isExist = await CameraTypeModel.findOne({ip:data.ip});

        if(isExist) return ctx.error={ msg: '类型编码为[' + data.typeCode + ']的摄像头类型已存在!' };

        const result = await CameraTypeService.add_cameraType(data);

        let msg = '';
        if(result) {
            msg = '添加摄像头类型'+ data.typeCode +'成功';
            return ctx.body = {msg:msg,data:data};
        }else{
            msg = '添加失败';
            return ctx.error={msg: msg};
        }

    }

    static async delete_cameraType(ctx) {
        const { id } = ctx.params;
        const result = await CameraTypeService.delete_cameraType({id:id});
        let msg = '';
        if(result) {
            msg = '删除摄像头类型成功';
            return ctx.body = {msg:msg,data:result};
        }else{
            msg = '删除摄像头类型失败';
            return ctx.error={msg: msg};
        }

    }

    static async edit_cameraType(ctx){
        const data = ctx.request.body;
        logger.info(data);
        let _id = data._id;
        delete data._id;
        const result = await CameraTypeService.edit_cameraType({_id:_id},data);
        if(result) return ctx.body = {msg:'修改摄像头类型成功',data:result};
        return ctx.error={msg: '修改摄像头类型失败!'};
    }

    static async find_cameraType(ctx){
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

        let pageStart = 0,pageEnd = 0;
        if(rangeObj && rangeObj.length >=2){
            pageStart = rangeObj[0];
            pageEnd = rangeObj[1];
        }

        const total = await CameraTypeService.getTotal();

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
                result = await CameraTypeService.find_cameraType(filterObj,sortP,pagination);
            }else{
                result = await CameraTypeService.find_cameraType(filterObj,sortP);
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
                result = await CameraTypeService.find_cameraType(filterObj,null,pagination);
            }else{
                result = await CameraTypeService.find_cameraType(filterObj);
            }
        }
        // let result = await CameraTypeService.find_cameraType(filterObj,sortP,pagination);
        if(result) return ctx.body = {msg:'查询摄像头类型',data:result,total:total};
        return ctx.error={msg: '没有找到摄像头类型!'};
    }

    static async find_cameraType_noPage(ctx){
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
        let result = await CameraTypeService.find_cameraType(null,sortP,null);
        if(result) return ctx.body = {msg:'查询摄像头类型',data:result};
        return ctx.error={msg: '没有找到摄像头类型!'};
    }

    static async find_one(ctx){
        const { id } = ctx.params;
        const result = await CameraTypeService.find_one(id);
        if(result) ctx.body = {msg:'查询摄像头类型',data:result};
        return ctx.error = {msg: '没有找到摄像头类型!'};
    }

}

export default CameraTypeController;