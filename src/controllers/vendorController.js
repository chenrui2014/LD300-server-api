/**
 * Created by chen on 17-8-23.
 */
import logger from '../logger';

import VendorService from '../services/vendorService';
import HostService from "../services/hostService";

class VendorController {
    static async add_vendor(ctx){
        const data = ctx.request.body;
        logger.info(data);

        if(!data) return ctx.error={ msg: '发送数据失败!' };
        const isExist = await VendorService.isExist({vendorCode:data.vendorCode})
        //const isExist = await VendorModel.findOne({ip:data.ip});

        if(isExist) return ctx.error={ msg: '厂商编码为[' + data.vendorCode + ']的厂商已存在!' };

        const result = await VendorService.add_vendor(data)

        let msg = '';
        if(result) {
            msg = '添加厂商'+ data.vendorCode +'成功';
            return ctx.body = {msg:msg,data:data};
        }else{
            msg = '添加失败';
            return ctx.error={msg: msg};
        }

    }

    static async delete_vendor(ctx) {
        const { id } = ctx.params;
        const result = await VendorService.delete_vendor({id:id})
        let msg = '';
        if(result) {
            msg = '删除厂商成功';
            return ctx.body = {msg:msg,data:result};
        }else{
            msg = '删除厂商失败';
            return ctx.error={msg: msg};
        }

    }

    static async edit_vendor(ctx){
        const data = ctx.request.body;
        logger.info(data);
        let _id = data._id;
        delete data._id;
        const result = await VendorService.edit_vendor({_id:_id},data);
        if(result) return ctx.body = {msg:'修改厂商成功',data:result};
        return ctx.error={msg: '修改厂商失败!'};
    }

    static async find_vendor(ctx){
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

        const total = await VendorService.getTotal();

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
                result = await VendorService.find_vendor(filterObj,sortP,pagination);
            }else{
                result = await VendorService.find_vendor(filterObj,sortP);
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
                result = await VendorService.find_vendor(filterObj,null,pagination);
            }else{
                result = await VendorService.find_vendor(filterObj);
            }
        }
        // let result = await VendorService.find_vendor(filterObj,sortP,pagination);
        if(result) return ctx.body = {msg:'查询厂商',data:result,total:total};
        return ctx.error={msg: '没有找到厂商!'};
    }

    static async find_vendor_noPage(ctx){
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
        let result = await VendorService.findAll(sortP);
        if(result) return ctx.body = {msg:'查询厂商',data:result};
        return ctx.error={msg: '没有找到厂商!'};
    }

    static async find_one(ctx){
        const { id } = ctx.params;
        const result = await VendorService.find_one(id);
        if(result) ctx.body = {msg:'查询厂商',data:result};
        return ctx.error = {msg: '没有找到厂商!'};
    }

}

export default VendorController;