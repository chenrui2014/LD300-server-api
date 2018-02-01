/**
 * Created by chen on 17-8-23.
 */
const {Parser}=require('../log/log');
const logger={};
Parser('logger','PresetController.js');

import PresetService from '../services/PresetService';
import HostService from '../services/hostService';
class PresetController {
    static async add_preset(ctx){
        const data = ctx.request.body;
        logger.info(data);

        if(!data) return ctx.error={ msg: '发送数据失败!' };
        // const isExist = await PresetService.isExist({ip:data.ip})
        // //const isExist = await CameraModel.findOne({ip:data.ip});
        //
        // if(isExist) return ctx.error={ msg: 'ip为[' + data.ip + ']的预置点ip已存在!' };

        const result = await PresetService.add_preset(data);

        let msg = '';
        if(result) {
            msg = '添加预置点'+ data.ip +'成功';
            return ctx.body = {msg:msg,data:data};
        }else{
            msg = '添加失败';
            return ctx.error={msg: msg};
        }

    }

    static async delete_preset(ctx) {
        const { id } = ctx.params;
        const result = await PresetService.delete_preset({id:id});
        let msg = '';
        if(result) {
            msg = '删除预置点成功';
            return ctx.body = {msg:msg,data:result};
        }else{
            msg = '删除预置点失败';
            return ctx.error={msg: msg};
        }

    }

    static async edit_preset(ctx){
        const data = ctx.request.body;
        logger.info(data);
        let _id = data._id;
        delete data._id;
        const result = await PresetService.edit_preset({_id:_id},data);
        if(result) return ctx.body = {msg:'修改预置点成功',data:result};
        return ctx.error={msg: '修改预置点失败!'};
    }

    static async find_preset(ctx){
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

        const total = await PresetService.getTotal();

        const pagination = {};
        pagination.pageStart = pageStart;
        pagination.pageSize = pageEnd-pageStart+1;

        let result = await PresetService.find_preset(filterObj,sortP,pagination);
        const hosts = await HostService.findAll();

        result.forEach(function (e) {
            hosts.forEach(function (host) {
                if(e._doc.hostId === host._doc.id) e._doc.hostName = host._doc.hostName;
                //return;
            });
        });
        if(result) return ctx.body = {msg:'查询预置点',data:result,total:total};
        return ctx.error={msg: '没有找到预置点!'};
    }

    static async find_preset_noPage(ctx){
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
        let result = await PresetService.findAll(sortP);
        if(result) return ctx.body = {msg:'查询预置点',data:result};
        return ctx.error={msg: '没有找到预置点!'};
    }

    static async find_one(ctx){
        const { id } = ctx.params;
        const result = await PresetService.find_one(id);
        if(result) ctx.body = {msg:'查询预置点',data:result};
        return ctx.error = {msg: '没有找到预置点!'};
    }

}

export default PresetController;