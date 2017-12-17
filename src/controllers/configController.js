/**
 * Created by chen on 17-8-23.
 */
import logger from '../logger';

import ConfigService from '../services/configService';

class ConfigController {
    static async add_config(ctx){
        const data = ctx.request.body;
        logger.info(data);

        if(!data) return ctx.error={ msg: '发送数据失败!' };
        const isExist = await ConfigService.isExist({ip:data.ip})
        //const isExist = await ConfigModel.findOne({ip:data.ip});

        if(isExist) return ctx.error={ msg: 'ip为[' + data.ip + ']的系统配置ip已存在!' };

        const result = await ConfigService.add_config(data)

        let msg = '';
        if(result) {
            msg = '添加系统配置'+ data.ip +'成功';
            return ctx.body = {msg:msg,data:data};
        }else{
            msg = '添加失败';
            return ctx.error={msg: msg};
        }

    }

    static async delete_config(ctx) {
        const { id } = ctx.params;
        const result = await ConfigService.delete_config({id:id})
        let msg = '';
        if(result) {
            msg = '删除系统配置成功';
            return ctx.body = {msg:msg,data:result};
        }else{
            msg = '删除系统配置失败';
            return ctx.error={msg: msg};
        }

    }

    static async edit_config(ctx){
        const data = ctx.request.body;
        logger.info(data);
        let _id = data._id;
        delete data._id;
        const result = await ConfigService.edit_config({_id:_id},data);
        if(result) return ctx.body = {msg:'修改系统配置成功',data:result};
        return ctx.error={msg: '修改系统配置失败!'};
    }

    static async find_config(ctx){
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

        const total = await ConfigService.getTotal();

        const pagination = {};
        pagination.pageStart = pageStart;
        pagination.pageSize = pageEnd-pageStart+1;

        let result = await ConfigService.find_config(filterObj,sortP,pagination);
        if(result) return ctx.body = {msg:'查询系统配置',data:result,total:total};
        return ctx.error={msg: '没有找到系统配置!'};
    }

    static async find_config_noPage(ctx){
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
        let result = await ConfigService.findAll(sortP);
        if(result) return ctx.body = {msg:'查询系统配置',data:result};
        return ctx.error={msg: '没有找到系统配置!'};
    }

    static async find_one(ctx){
        const { id } = ctx.params;
        const result = await ConfigService.find_one(id);
        if(result) ctx.body = {msg:'查询系统配置',data:result};
        return ctx.error = {msg: '没有找到系统配置!'};
    }

}

export default ConfigController;