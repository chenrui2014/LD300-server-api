/**
 * Created by chen on 17-8-23.
 */
import logger from '../logger';
import MonitoringService from '../services/monitoringService';

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
        let sortObj = JSON.parse(sort);
        let sortP = {};
        if(sortObj && sortObj.length >=2){
            if('ASC' ===sortObj[1]){
                sortP[sortObj[0]] = 1
            }else{
                sortP[sortObj[0]] = -1
            }
        }
        const result = await MonitoringService.findAll(sortP);
        if(result) return ctx.body = {msg:'查询监控区域',data:result};
        return ctx.body={msg: '没有找到监控区域!'};
    }
    static async find_one(ctx){
        const { id } = ctx.params;
        const result = await MonitoringService.find_one(id);
        if(!result) return ctx.body = {msg:'查询监控区域',data:result};
        return ctx.body = {msg: '没有找到监控区域!'};
    }

}

export default MonitoringAreaController;