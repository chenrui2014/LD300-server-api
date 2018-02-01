/**
 * Created by chen on 17-8-23.
 */
const {Parser}=require('../log/log');
const logger={};
Parser('logger','PerimeterController.js');
import PerimeterModel from '../models/perimeter.model';

class PerimeterController {
    static async add_perimeter(ctx){
        const data = ctx.request.body;
        logger.info(data);
        if(!data) return ctx.body={ msg: '发送数据失败!' };
        const isExit = await PerimeterModel.findOne({ip:data.fields.ip});
        logger.info(isExit);
        if(isExit) return ctx.body={ msg: '周界已添加!' };

        let perimeter = new PerimeterModel(data.fields);
        logger.info(perimeter);
        let msg = '';
        perimeter.save(function (err,perimeter) {
            if(!err) {
                msg = '添加周界'+ perimeter.name +'成功';
            }else{
                msg = err;
            }
        });

        return ctx.body = {msg:msg,data:perimeter};
    }

    static async delete_perimeter(ctx) {
        const { id } = ctx.params;
        logger.info(id);
        const result = await PerimeterModel.findByIdAndRemove(id).exec();
        if(!result) return ctx.error={msg: '删除周界失败!'};
        return ctx.body = {msg:'删除周界成功',data:result};
    }

    static async edit_perimeter(ctx){
        const data = ctx.request.body;
        logger.info(data);
        const result = await PerimeterModel.update(data,{id:data.id}).exec();
        if(!result) return ctx.error={msg: '修改周界失败!'};
        return ctx.body = {msg:'修改周界成功',data:result};
    }

    static async find_perimeter(ctx){
        const result = await PerimeterModel.find().exec();
        if(!result) return ctx.body={msg: '没有找到周界!'};
        return ctx.body = {msg:'查询周界',data:result};
    }
    static async find_one(ctx){
        const { id } = ctx.params;
        const result = await PerimeterModel.findOne({id:id}).exec();
        if(!result) return ctx.body = {msg: '没有找到周界!'};
        return ctx.body = {msg:'查询周界',data:result};
    }

}

export default PerimeterController;