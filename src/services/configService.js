/**
 * 操作系统配置数据对象
 * Created by chen on 17-8-23.
 */
import logger from '../logger';
import ConfigModel from '../models/config.model';
import uuidv1 from 'uuid/v1';
// const logger=require('../logger');
// const ConfigModel=require('../models/config.model');

class ConfigService {

    /**
     * 添加一个系统配置
     * @param data 需要添加的系统配置数据
     * @returns {Promise.<boolean>} 添加成功返回true，否则返回false；
     */
    static async add_config(data){
        //const id = await ConfigService.findMaxId();
        //data.id = Number(id) + 1;
        // let config = new ConfigModel(data);
        data.id = uuidv1();
        let success = false;
        await ConfigModel.create(data,function (err,config) {
            if(!err) {
                success = true;
                logger.info('添加系统配置成功');
            }else{
                logger.error(err.message);
            }
        });

        return success;
    }

    /**
     * 根据条件删除系统配置
     * @param conditions 删除条件
     * @returns {Promise.<boolean>}删除成功返回true，否则返回false；
     */
    static async delete_config(conditions) {
        let success = false;
        const result = await ConfigModel.remove(conditions,function (err,config) {
            if(!err) {
                success = true;
                logger.info('删除系统配置['+ config.ip +']成功');
            }else{
                logger.error(err.message);
            }
        });
        return success;
    }

    /**
     * 修改系统配置信息
     * @param conditions 修改条件
     * @param data 新的系统配置数据
     * @returns {Promise.<*>} 返回修改后的数据
     */
    static async edit_config(conditions,data){
        let result = null;
        result = await ConfigModel.update(conditions,data).exec();
        return result;
    }

    /**
     * 根据条件查询符合条件的系统配置数量
     * @param conditions
     * @returns {Promise.<*>}
     */
    static async getTotal(conditions){
        return await ConfigModel.find(conditions).count();

    }


    /**
     * 查询所有系统配置
     * @returns {Promise.<*>}
     */
    static async findAll(sort){
        if(sort){
            return await ConfigModel.find().sort(sort);
        }else{
            return await ConfigModel.find();
        }

    }

    /**
     * 根据条件查询系统配置
     * @param conditions 查询条件
     * @param sort 排序
     * @param pagination 分页
     * @returns {Promise.<*>} 返回查询到的数据
     */
    static async find_config(conditions,sort,pagination){
        let result = null;
        if(sort){

            if(pagination){
                result = await ConfigModel.find(conditions).skip(pagination.pageStart).limit(pagination.pageSize).sort(sort);
            }else{
                result = await ConfigModel.find().sort(sort);
            }
        }else{
            if(pagination){
                result = await ConfigModel.find(conditions).skip(pagination.pageStart).limit(pagination.pageSize);
            }else{
                result = await ConfigModel.find(conditions);
            }
        }

        return result;
    }

    /**
     * 根据ID查找系统配置信息
     * @param id
     * @returns {Promise.<*>}
     */
    static async find_one(id){
        return await ConfigModel.findOne({id:id});
    }

    /**
     * 获得ID最大值
     * @returns {Promise.<number>}
     */
    static async findMaxId(){
        const result = await ConfigModel.find().sort({id:-1}).limit(1);
        if(result && result.length > 0){
            return result[0]._doc.id;
        }else{
            return 0
        }
    }


    /**
     * 根据条件判断是否存在符合条件的系统配置
     * @param conditions 查询条件
     * @returns {Promise.<boolean>} 有符合条件的对象返回true，否则返回false
     */
    static async isExist(conditions){
        const result = await ConfigModel.find(conditions);
        if(result && result.length > 0){
            return true;
        }else{
            return false;
        }
    }

}

exports=module.exports=ConfigService;
//export default ConfigService;