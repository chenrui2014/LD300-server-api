/**
 * 操作事件数据对象
 * Created by chen on 17-8-23.
 */
//import logger from '../logger';
//import EventVideoModel from '../models/eventVideo.model';
//import uuidv1 from 'uuid/v1';

const logger=require('../logger');
const EventVideoModel=require('../models/eventVideo.model');
const uuidv1=require('uuid/v1');

class EventVideoService {

    /**
     * 添加一个事件
     * @param data 需要添加的事件数据
     * @returns {Promise.<boolean>} 添加成功返回true，否则返回false；
     */
    static async add_eventVideo(data){
        // const id = await EventVideoService.findMaxId();
        // data.id = Number(id) + 1;
        // let eventVideo = new EventVideoModel(data);
        if(!data.id){
            data.id = uuidv1();
        }


        let success = false;
        await EventVideoModel.create(data,function (err,eventVideo) {
            if(!err) {
                success = true;
                logger.info('添加事件成功');
            }else{
                logger.error(err.message);
            }
        });

        return success;
    }

    /**
     * 根据条件删除事件
     * @param conditions 删除条件
     * @returns {Promise.<boolean>}删除成功返回true，否则返回false；
     */
    static async delete_eventVideo(conditions) {
        let success = false;
        const result = await EventVideoModel.remove(conditions,function (err,eventVideo) {
            if(!err) {
                success = true;
                logger.info('删除事件['+ eventVideo.ip +']成功');
            }else{
                logger.error(err.message);
            }
        });
        return success;
    }

    /**
     * 修改事件信息
     * @param conditions 修改条件
     * @param data 新的事件数据
     * @returns {Promise.<*>} 返回修改后的数据
     */
    static async edit_eventVideo(conditions,data){
        let result = null;
        result = await EventVideoModel.update(conditions,data).exec();
        return result;
    }

    /**
     * 根据条件查询符合条件的事件数量
     * @param conditions
     * @returns {Promise.<*>}
     */
    static async getTotal(conditions){
        return await EventVideoModel.find(conditions).count();

    }


    /**
     * 查询所有事件
     * @returns {Promise.<*>}
     */
    static async findAll(sort){
        if(sort){
            return await EventVideoModel.find().sort(sort);
        }else{
            return await EventVideoModel.find();
        }

    }

    /**
     * 根据条件查询事件
     * @param conditions 查询条件
     * @param sort 排序
     * @param pagination 分页
     * @returns {Promise.<*>} 返回查询到的数据
     */
    static async find_eventVideo(conditions,sort,pagination){
        let result = null;
        if(sort){

            if(pagination){
                result = await EventVideoModel.find(conditions).skip(pagination.pageStart).limit(pagination.pageSize).sort(sort);
            }else{
                result = await EventVideoModel.find().sort(sort);
            }
        }else{
            if(pagination){
                result = await EventVideoModel.find(conditions).skip(pagination.pageStart).limit(pagination.pageSize);
            }else{
                result = await EventVideoModel.find(conditions);
            }
        }

        return result;
    }

    /**
     * 根据ID查找事件信息
     * @param id
     * @returns {Promise.<*>}
     */
    static async find_one(id){
        return await EventVideoModel.findOne({id:id});
    }

    /**
     * 获得ID最大值
     * @returns {Promise.<number>}
     */
    static async findMaxId(){
        const result = await EventVideoModel.find().sort({id:-1}).limit(1);
        if(result && result.length > 0){
            return result[0]._doc.id;
        }else{
            return 0
        }
    }


    /**
     * 根据条件判断是否存在符合条件的事件
     * @param conditions 查询条件
     * @returns {Promise.<boolean>} 有符合条件的对象返回true，否则返回false
     */
    static async isExist(conditions){
        const result = await EventVideoModel.find(conditions);
        if(result && result.length > 0){
            return true;
        }else{
            return false;
        }
    }

}

exports=module.exports=EventVideoService;
//export default EventVideoService;