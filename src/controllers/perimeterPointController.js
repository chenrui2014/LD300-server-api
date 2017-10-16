/**
 * Created by chen on 17-8-23.
 */
import logger from '../logger';
import PerimeterPointModel from '../models/perimeterPoint.model';

class PerimeterPointController {
    static async add_perimeterPoint(ctx){
        const data = ctx.request.body;
        logger.info(data);
        if(!data) return ctx.error={ msg: '发送数据失败!' };
        const isExit = await PerimeterPointModel.findOne({id:data.fields.id});
        logger.info(isExit);
        if(isExit) return ctx.error={ msg: '该摄像头ip已存在!' };

        let perimeterPoint = new PerimeterPointModel(data.fields);
        logger.info(perimeterPoint);
        let msg = '';
        perimeterPoint.save(function (err,perimeterPoint) {
            if(err) {
                msg = err;
            }else{
                msg = '添加周界点'+ perimeterPoint.name +'成功';
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
        const { sort,range,filter } = ctx.query;
        let sortObj = JSON.parse(sort);
        let sortP = {};
        if(sortObj && sortObj.length >=2){
            if('ASC' ===sortObj[1]){
                sortP[sortObj[0]] = 1
            }else{
                sortP[sortObj[0]] = -1
            }
        }

        const total = await PerimeterPointModel.find().count();
        const result = await PerimeterPointModel.find().sort(sortP);
        //const result = await PerimeterPointModel.find().exec();
        if(!result) return ctx.error={msg: '没有找到周界点!'};
        return ctx.body = {msg:'查询周界点',data:result,total:total};
    }
    static async find_one(ctx){
        const { id } = ctx.params;
        const result = await PerimeterPointModel.findOne({id:id}).exec();
        if(!result) return ctx.error = {msg: '没有找到周界点!'};
        return ctx.body = {msg:'查询周界点',data:result};
    }

}

export default PerimeterPointController;