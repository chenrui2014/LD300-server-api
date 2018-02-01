/**
 * Created by chen on 17-8-23.
 */
//import logger from '../logger';
//import {Monitoring as MonitoringAreaModel} from '../models/monitoringArea.model';

const {Parser}=require('../log/log');
const logger={};
Parser('logger','MonitoringAreaService.js');
const MonitoringAreaModel=require('../models/monitoringArea.model').Monitoring;

class MonitoringAreaService {
    /**
     * 添加一个监控区域
     * @param data 需要添加的监控区域数据
     * @returns {Promise.<boolean>} 添加成功返回true，否则返回false；
     */
    static async add_monitoringArea(data){
        const id = await MonitoringAreaService.findMaxId();
        data.id = Number(id) + 1;
        // let monitoringArea = new MonitoringAreaModel(data);
        let success = false;
        await MonitoringAreaModel.create(data,function (err,monitoringArea) {
            if(!err) {
                success = true;
                logger.info('添加监控区域成功');
            }else{
                logger.error(err.message);
            }
        });

        return success;
    }

    /**
     * 根据条件删除监控区域
     * @param conditions 删除条件
     * @returns {Promise.<boolean>}删除成功返回true，否则返回false；
     */
    static async delete_monitoringArea(conditions) {
        let success = false;
        const result = await MonitoringAreaModel.remove(conditions,function (err,monitoringArea) {
            if(!err) {
                success = true;
                logger.info('删除监控区域['+ monitoringArea.id +']成功');
            }else{
                logger.error(err.message);
            }
        });
        return success;
    }

    /**
     * 修改监控区域信息
     * @param conditions 修改条件
     * @param data 新的监控区域数据
     * @returns {Promise.<*>} 返回修改后的数据
     */
    static async edit_monitoringArea(conditions,data){
        let result = null;
        result = await MonitoringAreaModel.update(conditions,data).exec();
        return result;
    }

    /**
     * 根据条件查询符合条件的监控区域数量
     * @param conditions
     * @returns {Promise.<*>}
     */
    static async getTotal(conditions){
        return await MonitoringAreaModel.find(conditions).count();

    }


    /**
     * 查询所有监控区域
     * @returns {Promise.<*>}
     */
    static async findAll(sort){
        if(sort){
            return await MonitoringAreaModel.find().sort(sort);
        }else{
            return await MonitoringAreaModel.find();
        }

    }

    /**
     * 根据条件查询监控区域
     * @param conditions 查询条件
     * @param sort 排序
     * @param pagination 分页
     * @returns {Promise.<*>} 返回查询到的数据
     */
    static async find_monitoringArea(conditions,sort,pagination){
        let result = null;
        if(sort){

            if(pagination){
                result = await MonitoringAreaModel.find(conditions).skip(pagination.pageStart).limit(pagination.pageSize).sort(sort);
            }else{
                result = await MonitoringAreaModel.find().sort(sort);
            }
        }else{
            if(pagination){
                result = await MonitoringAreaModel.find(conditions).skip(pagination.pageStart).limit(pagination.pageSize);
            }else{
                result = await MonitoringAreaModel.find(conditions);
            }
        }

        return result;
    }

    /**
     * 根据ID查找监控区域信息
     * @param id
     * @returns {Promise.<*>}
     */
    static async find_one(id){
        return await MonitoringAreaModel.findOne({id:id});
    }

    /**
     * 获得ID最大值
     * @returns {Promise.<number>}
     */
    static async findMaxId(){
        const result = await MonitoringAreaModel.find().sort({id:-1}).limit(1);
        if(result && result.length > 0){
            return result[0]._doc.id;
        }else{
            return 0
        }
    }


    /**
     * 根据条件判断是否存在符合条件的监控区域
     * @param conditions 查询条件
     * @returns {Promise.<boolean>} 有符合条件的对象返回true，否则返回false
     */
    static async isExist(conditions){
        const result = await MonitoringAreaModel.find(conditions);
        if(result && result.length > 0){
            return true;
        }else{
            return false;
        }
    }

}

exports=module.exports=MonitoringAreaService;
//export default MonitoringAreaService;