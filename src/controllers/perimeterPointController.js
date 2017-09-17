/**
 * Created by chen on 17-8-23.
 */
import logger from '../logger';
import PerimeterPointModel from '../models/perimeterPoint.model';

class PerimeterPointController {
    static async add_perimeterPoint(ctx){
        const data = ctx.request.body;
        logger.info(data);
        if(!data) return ctx.body={ msg: '发送数据失败!' };
        const isExit = await PerimeterPointModel.findOne({ip:data.fields.ip});
        logger.info(isExit);
        if(isExit) return ctx.body={ msg: '该摄像头ip已存在!' };

        let perimeterPoint = new PerimeterPointModel(data.fields);
        logger.info(perimeterPoint);
        let msg = '';
        perimeterPoint.save(function (err,perimeterPoint) {
            if(!err) {
                msg = '添加周界点'+ perimeterPoint.name +'成功';
            }else{
                msg = err;
            }
        });

        return ctx.body = {msg:msg,data:perimeterPoint};
    }

    static async delete_perimeterPoint(ctx) {
        const { id } = ctx.params;
        logger.info(id);
        const result = await PerimeterPointModel.findByIdAndRemove(id).exec();
        if(!result) return ctx.error={msg: '删除周界点失败!'};
        return ctx.body = {msg:'删除周界点成功',data:result};
    }

    static async edit_perimeterPoint(ctx){
        const data = ctx.request.body;
        logger.info(data);
        const result = await PerimeterPointModel.update(data,{id:data.id}).exec();
        if(!result) return ctx.error={msg: '修改周界点失败!'};
        return ctx.body = {msg:'修改周界点成功',data:result};
    }

    static async find_perimeterPoint(ctx){
        const result = await PerimeterPointModel.find().exec();
        if(!result) return ctx.body={msg: '没有找到周界点!'};
        return ctx.body = {msg:'查询周界点',data:result};
    }
    static async find_one(ctx){
        const { id } = ctx.params;
        const result = await PerimeterPointModel.findOne({id:id}).exec();
        if(!result) return ctx.body = {msg: '没有找到周界点!'};
        return ctx.body = {msg:'查询周界点',data:result};
    }

}

export default PerimeterPointController;