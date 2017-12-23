/**
 * Created by chen on 17-8-23.
 */
import logger from '../logger';
import PpService from '../services/ppService';

class PpController {
    static async add_pp(ctx){
        const data = ctx.request.body;
        logger.info(data);
        if(!data) return ctx.body={ msg: '发送数据失败!' };
        const isExit = await PpService.isExist({name:data.name});
        logger.info(isExit);
        if(isExit) return ctx.body={ msg: '主机已存在!' };

        const result = await PpService.add_pp(data)

        let msg = '';
        if(result) {
            msg = '添加主机'+ data.port +'成功';
            return ctx.body = {msg:msg,data:data};
        }else{
            msg = '添加失败';
            return ctx.error={msg: msg};
        }



    }

    static async delete_pp(ctx) {
        const { id } = ctx.params;
        logger.info(id);
        const result = await PpService.delete_pp({id:id});
        let msg = '';
        if(result) {
            msg = '删除主机成功';
            return ctx.body = {msg:msg,data:result};
        }else{
            msg = '删除主机失败';
            return ctx.error={msg: msg};
        }

    }

    static async edit_pp(ctx){
        const data = ctx.request.body;
        logger.info(data);
        let _id = data._id;
        delete data._id;
        const result = await PpService.edit_pp({_id:_id},data);
        if(result) return ctx.body = {msg:'修改主机成功',data:result};
        return ctx.error={msg: '修改主机失败!'};
    }

    static async find_pp_noPage(ctx){
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
        let result = await PpService.findAll(sortP);
        if(result) return ctx.body = {msg:'查询主机',data:result};
        return ctx.body={msg: '没有找到主机!'};
    }

    static async find_pp(ctx){
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
            const total = await PpService.getTotal();

            const pagination = {};
            pagination.pageStart = pageStart;
            pagination.pageSize = pageEnd-pageStart+1;

            let result = await PpService.find_pp(filterObj,sortP,pagination);
            if(result) return ctx.body = {msg:'查询主机',data:result,total:total};
            return ctx.body={msg: '没有找到主机!'};
        }catch(error){
            logger.error(error);
        }

    }
    static async find_one(ctx){
        const { id } = ctx.params;
        try{
            const result = await PpService.find_one(id);
            if(result) return ctx.body = {msg:'查询主机',data:result};
            return ctx.body = {msg: '没有找到主机!'};
        }catch(error){
            logger.error(error);
        }

    }

}

export default PpController;