/**
 * 操作厂商数据对象
 * Created by chen on 17-8-23.
 */
//import logger from '../logger';
//import VendorModel from '../models/vendor.model';
//import uuidv1 from 'uuid/v1';

const logger=require('../logger');
const VendorModel=require('../models/vendor.model');
const uuidv1=require('uuid/v1');

class VendorService {

    /**
     * 添加一个厂商
     * @param data 需要添加的厂商数据
     * @returns {Promise.<boolean>} 添加成功返回true，否则返回false；
     */
    static async add_vendor(data){
        // const id = await VendorService.findMaxId();
        // data.id = Number(id) + 1;
        // let vendor = new VendorModel(data);
        data.id = uuidv1();
        let success = false;
        await VendorModel.create(data,function (err,vendor) {
            if(!err) {
                success = true;
                logger.info('添加厂商成功');
            }else{
                logger.error(err.message);
            }
        });


        return success;
    }

    /**
     * 根据条件删除厂商
     * @param conditions 删除条件
     * @returns {Promise.<boolean>}删除成功返回true，否则返回false；
     */
    static async delete_vendor(conditions) {
        let success = false;
        const result = await VendorModel.remove(conditions,function (err,vendor) {
            if(!err) {
                success = true;
                logger.info('删除厂商['+ vendor.ip +']成功');
            }else{
                logger.error(err.message);
            }
        });
        return success;
    }

    /**
     * 修改厂商信息
     * @param conditions 修改条件
     * @param data 新的厂商数据
     * @returns {Promise.<*>} 返回修改后的数据
     */
    static async edit_vendor(conditions,data){
        let result = null;
        result = await VendorModel.update(conditions,data).exec();
        return result;
    }

    /**
     * 根据条件查询符合条件的厂商数量
     * @param conditions
     * @returns {Promise.<*>}
     */
    static async getTotal(conditions){
        return await VendorModel.find(conditions).count();

    }


    /**
     * 查询所有厂商
     * @returns {Promise.<*>}
     */
    static async findAll(sort){
        if(sort){
            return await VendorModel.find().sort(sort);
        }else{
            return await VendorModel.find();
        }

    }

    /**
     * 根据条件查询厂商
     * @param conditions 查询条件
     * @param sort 排序
     * @param pagination 分页
     * @returns {Promise.<*>} 返回查询到的数据
     */
    static async find_vendor(conditions,sort,pagination){
        let result = null;
        if(sort){

            if(pagination){
                result = await VendorModel.find(conditions).skip(pagination.pageStart).limit(pagination.pageSize).sort(sort);
            }else{
                result = await VendorModel.find().sort(sort);
            }
        }else{
            if(pagination){
                result = await VendorModel.find(conditions).skip(pagination.pageStart).limit(pagination.pageSize);
            }else{
                result = await VendorModel.find(conditions);
            }
        }

        return result;
    }

    /**
     * 根据ID查找厂商信息
     * @param id
     * @returns {Promise.<*>}
     */
    static async find_one(id){
        return await VendorModel.findOne({id:id});
    }

    /**
     * 获得ID最大值
     * @returns {Promise.<number>}
     */
    static async findMaxId(){
        const result = await VendorModel.find().sort({id:-1}).limit(1);
        if(result && result.length > 0){
            return result[0]._doc.id;
        }else{
            return 0
        }
    }


    /**
     * 根据条件判断是否存在符合条件的厂商
     * @param conditions 查询条件
     * @returns {Promise.<boolean>} 有符合条件的对象返回true，否则返回false
     */
    static async isExist(conditions){
        const result = await VendorModel.find(conditions);
        if(result && result.length > 0){
            return true;
        }else{
            return false;
        }
    }

}

exports=module.exports=VendorService;
//export default VendorService;