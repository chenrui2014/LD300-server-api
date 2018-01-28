/**
 * 操作预置点数据对象
 * Created by chen on 17-8-23.
 */
//import logger from '../logger';
//import {Monitoring as MonitoringAreaModel, Preset as PresetModel} from '../models/monitoringArea.model';

const logger=require('../logger');
const Preset=require('../models/monitoringArea.model').PresetModel;


class PresetService {

    /**
     * 添加一个预置点
     * @param data 需要添加的预置点数据
     * @returns {Promise.<boolean>} 添加成功返回true，否则返回false；
     */
    static async add_preset(data){
        const id = await PresetService.findMaxId();
        data.id = Number(id) + 1;
        // let preset = new PresetModel(data);
        let success = false;
        await PresetModel.create(data,function (err,preset) {
            if(!err) {
                success = true;
                logger.info('添加周界成功');
            }else{
                logger.error(err.message);
            }
        });
        return success;
    }

    /**
     * 根据条件删除预置点
     * @param conditions 删除条件
     * @returns {Promise.<boolean>}删除成功返回true，否则返回false；
     */
    static async delete_preset(conditions) {
        let success = false;
        const result = await PresetModel.remove(conditions,function (err,preset) {
            if(!err) {
                success = true;
                logger.info('删除预置点['+ preset.ip +']成功');
            }else{
                logger.error(err.message);
            }
        });
        return success;
    }

    /**
     * 修改预置点信息
     * @param conditions 修改条件
     * @param data 新的预置点数据
     * @returns {Promise.<*>} 返回修改后的数据
     */
    static async edit_preset(conditions,data){
        let result = null;
        result = await PresetModel.update(conditions,data).exec();
        return result;
    }

    /**
     * 根据条件查询符合条件的预置点数量
     * @param conditions
     * @returns {Promise.<*>}
     */
    static async getTotal(conditions){
        return await PresetModel.find(conditions).count();

    }


    /**
     * 查询所有预置点
     * @returns {Promise.<*>}
     */
    static async findAll(sort){
        if(sort){
            return await PresetModel.find().sort(sort);
        }else{
            return await PresetModel.find();
        }

    }

    /**
     * 根据条件查询预置点
     * @param conditions 查询条件
     * @param sort 排序
     * @param pagination 分页
     * @returns {Promise.<*>} 返回查询到的数据
     */
    static async find_preset(conditions,sort,pagination){
        let result = null;
        if(sort){

            if(pagination){
                result = await PresetModel.find(conditions).skip(pagination.pageStart).limit(pagination.pageSize).sort(sort);
            }else{
                result = await PresetModel.find().sort(sort);
            }
        }else{
            if(pagination){
                result = await PresetModel.find(conditions).skip(pagination.pageStart).limit(pagination.pageSize);
            }else{
                result = await PresetModel.find(conditions);
            }
        }

        return result;
    }

    /**
     * 根据ID查找预置点信息
     * @param id
     * @returns {Promise.<*>}
     */
    static async find_one(id){
        return await PresetModel.findOne({id:id});
    }

    /**
     * 获得ID最大值
     * @returns {Promise.<number>}
     */
    static async findMaxId(){
        const result = await PresetModel.find().sort({id:-1}).limit(1);
        if(result && result.length > 0){
            return result[0]._doc.id;
        }else{
            return 0
        }
    }


    /**
     * 根据条件判断是否存在符合条件的预置点
     * @param conditions 查询条件
     * @returns {Promise.<boolean>} 有符合条件的对象返回true，否则返回false
     */
    static async isExist(conditions){
        const result = await PresetModel.find(conditions);
        if(result && result.length > 0){
            return true;
        }else{
            return false;
        }
    }

}

exports=module.exports=PresetService;
//export default PresetService;