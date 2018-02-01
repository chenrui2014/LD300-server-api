/**
 * Created by chen on 17-8-23.
 */
//import logger from '../logger';
//import HostModel from '../models/host.model';
//import uuidv1 from 'uuid/v1';

const {Parser}=require('../log/log');
const logger={};
Parser('logger','HostService.js');
const HostModel =require('../models/host.model');
const uuidv1=require('uuid/v1');

class HostService {
    /**
     * 添加一个主机
     * @param data 需要添加的主机数据
     * @returns {Promise.<boolean>} 添加成功返回true，否则返回false；
     */
    static async add_host(data){
        // const id = await HostService.findMaxId();
        // data.id = Number(id) + 1;
        // let host = new HostModel(data);
        data.id = uuidv1();
        let success = false;
        await HostModel.create(data,function (err,host) {
            if(!err) {
                success = true;
                logger.info('添加摄像头['+ host.port +']成功');
            }else{
                logger.error(err.message);
            }
        });

        return success;
    }

    /**
     * 根据条件删除主机
     * @param conditions 删除条件
     * @returns {Promise.<boolean>}删除成功返回true，否则返回false；
     */
    static async delete_host(conditions) {
        let success = false;
        const result = await HostModel.remove(conditions,function (err,host) {
            if(!err) {
                success = true;
                logger.info('删除主机['+ host.port +']成功');
            }else{
                logger.error(err.message);
            }
        });
        return success;
    }

    /**
     * 修改主机信息
     * @param conditions 修改条件
     * @param data 新的主机数据
     * @returns {Promise.<*>} 返回修改后的数据
     */
    static async edit_host(conditions,data){
        let result = null;
        result = await HostModel.update(conditions,data).exec();
        return result;
    }

    /**
     * 根据条件查询符合条件的主机数量
     * @param conditions
     * @returns {Promise.<*>}
     */
    static async getTotal(conditions){
        return await HostModel.find(conditions).count();

    }


    /**
     * 查询所有主机
     * @returns {Promise.<*>}
     */
    static async findAll(sort){
        if(sort){
            return await HostModel.find().sort(sort);
        }else{
            return await HostModel.find();
        }

    }

    /**
     * 根据条件查询主机
     * @param conditions 查询条件
     * @param sort 排序
     * @param pagination 分页
     * @returns {Promise.<*>} 返回查询到的数据
     */
    static async find_host(conditions,sort,pagination){
        let result = null;
        if(sort){

            if(pagination){
                result = await HostModel.find(conditions).skip(pagination.pageStart).limit(pagination.pageSize).sort(sort);
            }else{
                result = await HostModel.find().sort(sort);
            }
        }else{
            if(pagination){
                result = await HostModel.find(conditions).skip(pagination.pageStart).limit(pagination.pageSize);
            }else{
                result = await HostModel.find(conditions);
            }
        }

        return result;
    }

    /**
     * 根据ID查找主机信息
     * @param id
     * @returns {Promise.<*>}
     */
    static async find_one(id){
        return await HostModel.findOne({id:id});
    }

    /**
     * 获得ID最大值
     * @returns {Promise.<number>}
     */
    static async findMaxId(){
        const result = await HostModel.find().sort({id:-1}).limit(1);
        if(result && result.length > 0){
            return result[0]._doc.id;
        }else{
            return 0
        }
    }


    /**
     * 根据条件判断是否存在符合条件的主机
     * @param conditions 查询条件
     * @returns {Promise.<boolean>} 有符合条件的对象返回true，否则返回false
     */
    static async isExist(conditions){
        const result = await HostModel.find(conditions);
        if(result && result.length > 0){
            return true;
        }else{
            return false;
        }
    }

}

exports=module.exports=HostService;
//export default HostService;