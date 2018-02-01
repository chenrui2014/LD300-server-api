/**
 * Created by chen on 17-8-23.
 */
const {Parser}=require('../log/log');
const logger={};
Parser('logger','UnitController.js');

import UnitService from '../services/unitService';

class UnitController {
    static async add_unit(ctx){
        const data = ctx.request.body;
        logger.info(data);

        if(!data) return ctx.error={ msg: '发送数据失败!' };
        const isExist = await UnitService.isExist({ip:data.ip});
        //const isExist = await UnitModel.findOne({ip:data.ip});

        if(isExist) return ctx.error={ msg: 'ip为[' + data.ip + ']的单位ip已存在!' };

        const result = await UnitService.add_unit(data);

        let msg = '';
        if(result) {
            msg = '添加单位'+ data.ip +'成功';
            return ctx.body = {msg:msg,data:data};
        }else{
            msg = '添加失败';
            return ctx.error={msg: msg};
        }

    }

    static async delete_unit(ctx) {
        const { id } = ctx.params;
        const result = await UnitService.delete_unit({id:id});
        let msg = '';
        if(result) {
            msg = '删除单位成功';
            return ctx.body = {msg:msg,data:result};
        }else{
            msg = '删除单位失败';
            return ctx.error={msg: msg};
        }

    }

    static async edit_unit(ctx){
        const data = ctx.request.body;
        logger.info(data);
        let _id = data._id;
        delete data._id;
        const result = await UnitService.edit_unit({_id:_id},data);
        if(result) return ctx.body = {msg:'修改单位成功',data:result};
        return ctx.error={msg: '修改单位失败!'};
    }

    static async find_unit(ctx){
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

        let pageStart = 0,pageEnd = 0;
        if(rangeObj && rangeObj.length >=2){
            pageStart = rangeObj[0];
            pageEnd = rangeObj[1];
        }

        const total = await UnitService.getTotal();

        const pagination = {};
        pagination.pageStart = pageStart;
        pagination.pageSize = pageEnd-pageStart+1;

        let result = await UnitService.find_unit(filterObj,sortP,pagination);
        if(result) return ctx.body = {msg:'查询单位',data:result,total:total};
        return ctx.error={msg: '没有找到单位!'};
    }

    static async find_unit_noPage(ctx){
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
        let result = await UnitService.findAll(sortP);
        if(result) return ctx.body = {msg:'查询单位',data:result};
        return ctx.error={msg: '没有找到单位!'};
    }

    static async find_one(ctx){
        const { id } = ctx.params;
        const result = await UnitService.find_one(id);
        if(result) ctx.body = {msg:'查询单位',data:result};
        return ctx.error = {msg: '没有找到单位!'};
    }

}

export default UnitController;