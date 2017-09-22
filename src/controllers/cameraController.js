/**
 * Created by chen on 17-8-23.
 */
import logger from '../logger';
import CameraModel from '../models/camera.model';

class CameraController {
    static async add_camera(ctx){
        const data = ctx.request.body;
        logger.info(data);
        if(!data) return ctx.body={ msg: '发送数据失败!' };
        let oneCamera=null;
        await CameraModel.findOne({ip:data.ip},function (error,doc) {
            oneCamera = doc;
        });
        logger.info(oneCamera);
        if(oneCamera) return ctx.body={ msg: '该摄像头ip已存在!' };
        //const result = await CameraModel.create(data);

        let camera = new CameraModel(data);
        logger.info(camera);
        let msg = '';
        await camera.save(function (err,camera) {
            if(!err) {
                msg = '添加摄像头'+ camera.name +'成功';
            }else{
                msg = err.errmsg;
            }
        });

        return ctx.body = {msg:msg,data:camera};
        //if(!result) return ctx.error({msg:'添加摄像头失败'})

        //return ctx.body = {msg:'添加摄像头成功',data:result};
    }

    static async delete_camera(ctx) {
        const { id } = ctx.params;
        logger.info(id);
        const result = await CameraModel.remove({id:id});
        if(!result) return ctx.error={msg: '删除摄像头失败!'};
        return ctx.body = {msg:'删除摄像头成功',data:result};
    }

    static async edit_camera(ctx){
        const data = ctx.request.body;
        logger.info(data);
        let _id = data._id;
        delete data._id;
        const result = await CameraModel.update({_id:_id},data).exec();
        if(!result) return ctx.error={msg: '修改摄像头失败!'};
        return ctx.body = {msg:'修改摄像头成功',data:result};
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

        const total = await CameraModel.find(filterObj).count();

        let result = await CameraModel.find(filterObj).skip(pageStart).limit(pageEnd-pageStart+1).sort(sortP);
        //const result = await CameraModel.find().exec();
        if(!result) return ctx.body={msg: '没有找到摄像头!'};
        return ctx.body = {msg:'查询摄像头',data:result,total:total};
    }
    static async find_one(ctx){
        const { id } = ctx.params;
        const result = await CameraModel.findOne({id:id});
        if(!result) return ctx.body = {msg: '没有找到摄像头!'};
        return ctx.body = {msg:'查询摄像头',data:result};
    }

}

export default CameraController;