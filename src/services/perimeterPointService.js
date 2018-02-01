/**
 * Created by chen on 17-8-23.
 */
//import logger from '../logger';
//import PerimeterPointModel from '../models/perimeterPoint.model';
//import uuidv1 from 'uuid/v1';

const {Parser}=require('../log/log');
const logger={};
Parser('logger','PerimeterPointService.js');
const PerimeterPointModel=require('../models/perimeterPoint.model');
const uuidv1=require('uuid/v1');

class PerimeterPointService {
    /**
     * 添加一个周界点
     * @param data 需要添加的周界点数据
     * @returns {Promise.<boolean>} 添加成功返回true，否则返回false；
     */
    static async add_perimeterPoint(data){
        // const id = await PerimeterPointService.findMaxId();
        // data.id = Number(id) + 1;
        // let perimeterPoint = new PerimeterPointModel(data);
        data.id = uuidv1();
        let success = false;
        await PerimeterPointModel.create(data,function (err,perimeterPoint) {
            if(!err) {
                success = true;
                logger.info('添加周界点成功');
            }else{
                logger.error(err.message);
            }
        });

        return success;
    }

    static async add_list(data){
        let success = true;
        if(Array.isArray(data)){
            for(let i = 0,len=data.length; i < len; i++) {
                success =await PerimeterPointService.add_perimeterPoint(data[i]);
            }
        }
        return success;
    }

    /**
     * 根据条件删除周界点
     * @param conditions 删除条件
     * @returns {Promise.<boolean>}删除成功返回true，否则返回false；
     */
    static async delete_perimeterPoint(conditions) {
        let success = false;
        const result = await PerimeterPointModel.remove(conditions,function (err,perimeterPoint) {
            if(!err) {
                success = true;
                logger.info('删除周界点['+ perimeterPoint.realPosition +']成功');
            }else{
                logger.error(err.message);
            }
        });
        return success;
    }

    /**
     * 修改周界点信息
     * @param conditions 修改条件
     * @param data 新的周界点数据
     * @returns {Promise.<*>} 返回修改后的数据
     */
    static async edit_perimeterPoint(conditions,data){
        let result = null;
        result = await PerimeterPointModel.update(conditions,data).exec();
        return result;
    }

    /**
     * 根据条件查询符合条件的周界点数量
     * @param conditions
     * @returns {Promise.<*>}
     */
    static async getTotal(conditions){
        return await PerimeterPointModel.find(conditions).count();

    }


    /**
     * 查询所有周界点
     * @returns {Promise.<*>}
     */
    static async findAll(sort){
        if(sort){
            return await PerimeterPointModel.find().sort(sort);
        }else{
            return await PerimeterPointModel.find();
        }

    }

    /**
     * 根据条件查询周界点
     * @param conditions 查询条件
     * @param sort 排序
     * @param pagination 分页
     * @returns {Promise.<*>} 返回查询到的数据
     */
    static async find_perimeterPoint(conditions,sort,pagination){
        let result = null;
        if(sort){

            if(pagination){
                result = await PerimeterPointModel.find(conditions).skip(pagination.pageStart).limit(pagination.pageSize).sort(sort);
            }else{
                result = await PerimeterPointModel.find().sort(sort);
            }
        }else{
            if(pagination){
                result = await PerimeterPointModel.find(conditions).skip(pagination.pageStart).limit(pagination.pageSize);
            }else{
                result = await PerimeterPointModel.find(conditions);
            }
        }

        return result;
    }

    /**
     * 根据ID查找周界点信息
     * @param id
     * @returns {Promise.<*>}
     */
    static async find_one(id){
        return await PerimeterPointModel.findOne({id:id});
    }

    /**
     * 获得ID最大值
     * @returns {Promise.<number>}
     */
    static async findMaxId(){
        const result = await PerimeterPointModel.find().sort({id:-1}).limit(1);
        if(result && result.length > 0){
            return result[0]._doc.id;
        }else{
            return 0
        }
    }


    /**
     * 根据条件判断是否存在符合条件的周界点
     * @param conditions 查询条件
     * @returns {Promise.<boolean>} 有符合条件的对象返回true，否则返回false
     */
    static async isExist(conditions){
        const result = await PerimeterPointModel.find(conditions);
        if(result && result.length > 0){
            return true;
        }else{
            return false;
        }
    }

}

exports=module.exports=PerimeterPointService;
//export default PerimeterPointService;