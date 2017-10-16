/**
 * Created by chen on 17-8-23.
 */
import logger from '../logger';
import HostModel from '../models/host.model';

class HostsController {
    static async add_host(ctx){
        const data = ctx.request.body;
        logger.info(data);
        if(!data) return ctx.body={ msg: '发送数据失败!' };
        const isExit = await HostModel.findOne({hostName:data.hostName});
        logger.info(isExit);
        if(isExit) return ctx.body={ msg: '主机已存在!' };

        let host = new HostModel(data);
        logger.info(host);
        let msg = '';
        host.save(function (err,host) {
            if(!err) {
                msg = '添加主机'+ host.name +'成功';
            }else{
                msg = err;
            }
        });

        return ctx.body = {msg:msg,data:host};

    }

    static async delete_host(ctx) {
        const { id } = ctx.params;
        logger.info(id);
        const result = await HostModel.findByIdAndRemove(id).exec();
        if(!result) return ctx.error={msg: '删除主机失败!'};
        return ctx.body = {msg:'删除主机成功',data:result};
    }

    static async edit_host(ctx){
        const data = ctx.request.body;
        logger.info(data);
        const result = await HostModel.update(data,{id:data.id}).exec();
        if(!result) return ctx.error={msg: '修改主机失败!'};
        return ctx.body = {msg:'修改主机成功',data:result};
    }

    static async find_host(ctx){
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

        try{
            const total = await HostModel.find(filterObj).count();
            let result = await HostModel.find(filterObj).skip(pageStart).limit(pageEnd-pageStart+1).sort(sortP);
            if(!result) return ctx.body={msg: '没有找到主机!'};
            return ctx.body = {msg:'查询主机',data:result,total:total};
        }catch(error){
            logger.error(error);
        }

    }
    static async find_one(ctx){
        const { id } = ctx.params;
        try{
            const result = await HostModel.findOne({id:id}).exec();
            if(!result) return ctx.body = {msg: '没有找到主机!'};
            return ctx.body = {msg:'查询主机',data:result};
        }catch(error){
            logger.error(error);
        }

    }

}

export default HostsController;