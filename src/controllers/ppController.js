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
        if(isExit) return ctx.body={ msg: '周界已存在!' };

        const result = await PpService.add_pp(data)

        let msg = '';
        if(result) {
            msg = '添加周界'+ data.port +'成功';
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
            msg = '删除周界成功';
            return ctx.body = {msg:msg,data:result};
        }else{
            msg = '删除周界失败';
            return ctx.error={msg: msg};
        }

    }

    static async edit_pp(ctx){
        const data = ctx.request.body;
        logger.info(data);
        let _id = data._id;
        delete data._id;
        const result = await PpService.edit_pp({_id:_id},data);
        if(result) return ctx.body = {msg:'修改周界成功',data:result};
        return ctx.error={msg: '修改周界失败!'};
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
        if(result) return ctx.body = {msg:'查询周界',data:result};
        return ctx.body={msg: '没有找到周界!'};
    }

    static async find_pp(ctx){
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



        try{
            const total = await PpService.getTotal();

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
                    result = await PpService.find_pp(filterObj,sortP,pagination);
                }else{
                    result = await PpService.find_pp(filterObj,sortP);
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
                    result = await PpService.find_pp(filterObj,null,pagination);
                }else{
                    result = await PpService.find_pp(filterObj);
                }
            }

            //result = await PpService.find_pp(filterObj,sortP,pagination);
            if(result) return ctx.body = {msg:'查询周界',data:result,total:total};
            return ctx.body={msg: '没有找到周界!'};
        }catch(error){
            logger.error(error);
        }

    }
    static async find_one(ctx){
        const { id } = ctx.params;
        try{
            const result = await PpService.find_one(id);
            if(result) return ctx.body = {msg:'查询周界',data:result};
            return ctx.body = {msg: '没有找到周界!'};
        }catch(error){
            logger.error(error);
        }

    }

}

export default PpController;