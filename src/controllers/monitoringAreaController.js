/**
 * Created by chen on 17-8-23.
 */
import logger from '../logger';
import MonitoringAreaModel from '../models/monitoringArea.model';

class MonitoringAreaController {
    static async add_monitoringArea(ctx){
        const data = ctx.request.body;
        logger.info(data);
        if(!data) return ctx.body={ msg: '发送数据失败!' };
        const isExit = await MonitoringAreaModel.findOne({ip:data.fields.ip});
        logger.info(isExit);
        if(isExit) return ctx.body={ msg: '该监控区域已添加!' };

        let monitoringArea = new MonitoringAreaModel(data.fields);
        logger.info(monitoringArea);
        let msg = '';
        monitoringArea.save(function (err,monitoringArea) {
            if(!err) {
                msg = '添加监控区域'+ monitoringArea.name +'成功';
            }else{
                msg = err;
            }
        });

        return ctx.body = {msg:msg,data:monitoringArea};
    }

    static async delete_monitoringArea(ctx) {
        const { id } = ctx.params;
        logger.info(id);
        const result = await MonitoringAreaModel.findByIdAndRemove(id).exec();
        if(!result) return ctx.error={msg: '删除监控区域失败!'};
        return ctx.body = {msg:'删除监控区域成功',data:result};
    }

    static async edit_monitoringArea(ctx){
        const data = ctx.request.body;
        logger.info(data);
        const result = await MonitoringAreaModel.update(data,{id:data.id}).exec();
        if(!result) return ctx.error={msg: '修改监控区域失败!'};
        return ctx.body = {msg:'修改监控区域成功',data:result};
    }

    static async find_monitoringArea(ctx){
        const result = await MonitoringAreaModel.find().exec();
        if(!result) return ctx.body={msg: '没有找到监控区域!'};
        return ctx.body = {msg:'查询监控区域',data:result};
    }
    static async find_one(ctx){
        const { id } = ctx.params;
        const result = await MonitoringAreaModel.findOne({id:id}).exec();
        if(!result) return ctx.body = {msg: '没有找到监控区域!'};
        return ctx.body = {msg:'查询监控区域',data:result};
    }

}

export default MonitoringAreaController;