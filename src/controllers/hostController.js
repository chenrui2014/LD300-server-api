/**
 * Created by chen on 17-8-23.
 */
const {Parser}=require('../log/log');
const logger={};
Parser(logger,'HostsController.js');
import HostService from '../services/hostService';
//import PpService from "../services/ppService";
import Serialport from '../serialport/serialport';

class HostsController {
    static async add_host(ctx){
        const data = ctx.request.body;
        logger.info(data);
        if(!data) return ctx.body={ msg: '发送数据失败!' };
        const isExit = await HostService.isExist({port:data.port});
        logger.info(isExit);
        if(isExit) return ctx.body={ msg: '主机已存在!' };

        const result = await HostService.add_host(data)

        let msg = '';
        if(result) {
            msg = '添加主机'+ data.port +'成功';
            return ctx.body = {msg:msg,data:data};
        }else{
            msg = '添加失败';
            return ctx.error={msg: msg};
        }



    }

    static async delete_host(ctx) {
        const { id } = ctx.params;
        logger.info(id);
        const result = await HostService.delete_host({id:id});
        let msg = '';
        if(result) {
            msg = '删除主机成功';
            return ctx.body = {msg:msg,data:result};
        }else{
            msg = '删除主机失败';
            return ctx.error={msg: msg};
        }

    }

    static async edit_host(ctx){
        const data = ctx.request.body;
        logger.info(data);
        let _id = data._id;
        delete data._id;
        const result = await HostService.edit_host({_id:_id},data);
        if(result) return ctx.body = {msg:'修改主机成功',data:result};
        return ctx.error={msg: '修改主机失败!'};
    }

    static async find_host_noPage(ctx){
        const { sort} = ctx.query;
        let sortObj = JSON.parse(sort);
        let sortP = {};
        if(sortObj && sortObj.length >=2){
            if('ASC' ===sortObj[1]){
                sortP[sortObj[0]] = 1;
            }else{
                sortP[sortObj[0]] = -1;
            }
        }
        let result = await HostService.findAll(sortP);
        if(result) return ctx.body = {msg:'查询主机',data:result};
        return ctx.body={msg: '没有找到主机!'};
    }

    static async getPort(ctx){
        let ports = await Serialport.GetPortsArrived();
        let portObj = ports.map((item/*,i*/)=>{
            return {name:item,id:item};
        });
        return ctx.body = {msg:'获取本机端口',data:portObj};
    }

    static async find_host(ctx){
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

        try{
            const total = await HostService.getTotal();

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
                    result = await HostService.find_host(filterObj,sortP,pagination);
                }else{
                    result = await HostService.find_host(filterObj,sortP);
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
                    result = await HostService.find_host(filterObj,null,pagination);
                }else{
                    result = await HostService.find_host(filterObj);
                }
            }

            // let result = await HostService.find_host(filterObj,sortP,pagination);
            if(result) return ctx.body = {msg:'查询主机',data:result,total:total};
            return ctx.body={msg: '没有找到主机!'};
        }catch(error){
            logger.error(error);
        }

    }
    static async find_one(ctx){
        const { id } = ctx.params;
        try{
            const result = await HostService.find_one(id);
            if(result) return ctx.body = {msg:'查询主机',data:result};
            return ctx.body = {msg: '没有找到主机!'};
        }catch(error){
            logger.error(error);
        }

    }

}

export default HostsController;