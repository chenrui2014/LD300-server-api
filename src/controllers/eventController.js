/**
 * Created by chen on 17-8-23.
 */
import logger from '../logger';
import EventModel from '../models/event.model';

class EventController {
    static async add_event(ctx){
        const data = ctx.request.body;
        logger.info(data);
        if(!data) return ctx.body={ msg: '发送数据失败!' };
        const isExit = await EventModel.findOne({ip:data.fields.ip});
        logger.info(isExit);
        if(isExit) return ctx.body={ msg: 'ID冲突!' };

        let event = new EventModel(data.fields);
        logger.info(event);
        let msg = '';
        event.save(function (err,event) {
            if(!err) {
                msg = '添加事件'+ event.name +'成功';
            }else{
                msg = err;
            }
        });

        return ctx.body = {msg:msg,data:event};
    }

    static async delete_event(ctx) {
        const { id } = ctx.params;
        logger.info(id);
        const result = await EventModel.findByIdAndRemove(id).exec();
        if(!result) return ctx.error={msg: '删除事件失败!'};
        return ctx.body = {msg:'删除事件成功',data:result};
    }

    static async edit_event(ctx){
        const data = ctx.request.body;
        logger.info(data);
        const result = await EventModel.update(data,{id:data.id}).exec();
        if(!result) return ctx.error={msg: '修改事件失败!'};
        return ctx.body = {msg:'修改事件成功',data:result};
    }

    static async find_event(ctx){
        const result = await EventModel.find().exec();
        if(!result) return ctx.body={msg: '没有找到事件!'};
        return ctx.body = {msg:'查询事件',data:result};
    }
    static async find_one(ctx){
        const { id } = ctx.params;
        const result = await EventModel.findOne({id:id}).exec();
        if(!result) return ctx.body = {msg: '没有找到事件!'};
        return ctx.body = {msg:'查询事件',data:result};
    }

}

export default EventController;