import logger from '../logger';
import PpModel from '../models/pp.model';
import uuidv1 from 'uuid/v1';
import {Monitoring as MonitoringAreaModel} from "../models/monitoringArea.model";
// const logger=require('../logger');
// const PpModel=require('../models/pp.model');

class PpService {
    /**
     * 添加一个周界
     * @param data 需要添加的周界数据
     * @returns {Promise.<boolean>} 添加成功返回true，否则返回false；
     */
    static async add_pp(data){
        // const id = await PpService.findMaxId();
        // data.id = Number(id) + 1;
        // let pp = new PpModel(data);
        data.id = uuidv1();
        let ppId=null;
        await PpModel.create(data,function (err,pp) {
            if(!err) {
                ppId = pp._doc.id;
                logger.info('添加周界成功');
            }else{
                logger.error(err.message);
            }
        });

        return ppId;
    }

    /**
     * 根据条件删除周界
     * @param conditions 删除条件
     * @returns {Promise.<boolean>}删除成功返回true，否则返回false；
     */
    static async delete_pp(conditions) {
        let success = false;
        const result = await PpModel.remove(conditions,function (err,pp) {
            if(!err) {
                success = true;
                logger.info('删除周界['+ pp.realPosition +']成功');
            }else{
                logger.error(err.message);
            }
        });
        return success;
    }

    /**
     * 修改周界信息
     * @param conditions 修改条件
     * @param data 新的周界数据
     * @returns {Promise.<*>} 返回修改后的数据
     */
    static async edit_pp(conditions,data){
        let result = null;
        result = await PpModel.update(conditions,data).exec();
        return result;
    }

    /**
     * 根据条件查询符合条件的周界数量
     * @param conditions
     * @returns {Promise.<*>}
     */
    static async getTotal(conditions){
        return await PpModel.find(conditions).count();

    }


    /**
     * 查询所有周界
     * @returns {Promise.<*>}
     */
    static async findAll(sort){
        if(sort){
            return await PpModel.find().sort(sort);
        }else{
            return await PpModel.find();
        }

    }

    /**
     * 根据条件查询周界
     * @param conditions 查询条件
     * @param sort 排序
     * @param pagination 分页
     * @returns {Promise.<*>} 返回查询到的数据
     */
    static async find_pp(conditions,sort,pagination){
        let result = null;
        if(sort){

            if(pagination){
                result = await PpModel.find(conditions).skip(pagination.pageStart).limit(pagination.pageSize).sort(sort);
            }else{
                result = await PpModel.find().sort(sort);
            }
        }else{
            if(pagination){
                result = await PpModel.find(conditions).skip(pagination.pageStart).limit(pagination.pageSize);
            }else{
                result = await PpModel.find(conditions);
            }
        }

        return result;
    }

    /**
     * 根据ID查找周界信息
     * @param id
     * @returns {Promise.<*>}
     */
    static async find_one(id){
        return await PpModel.findOne({id:id});
    }

    /**
     * 获得ID最大值
     * @returns {Promise.<number>}
     */
    static async findMaxId(){
        const result = await PpModel.find().sort({id:-1}).limit(1);
        if(result && result.length > 0){
            return result[0]._doc.id;
        }else{
            return 0
        }
    }


    /**
     * 根据条件判断是否存在符合条件的周界
     * @param conditions 查询条件
     * @returns {Promise.<boolean>} 有符合条件的对象返回true，否则返回false
     */
    static async isExist(conditions){
        const result = await PpModel.find(conditions);
        if(result && result.length > 0){
            return true;
        }else{
            return false;
        }
    }

}

exports=module.exports=PpService;