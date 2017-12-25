/**
 * 操作摄像头类型数据对象
 * Created by chen on 17-8-23.
 */
import logger from '../logger';
import CameraTypeModel from '../models/cameraType.model';
import uuidv1 from 'uuid/v1';
// const logger=require('../logger');
// const CameraTypeModel=require('../models/cameraType.model');

class CameraTypeService {

    /**
     * 添加一个摄像头类型
     * @param data 需要添加的摄像头类型数据
     * @returns {Promise.<boolean>} 添加成功返回true，否则返回false；
     */
    static async add_cameraType(data){
        // const id = await CameraTypeService.findMaxId();
        // data.id = Number(id) + 1;
        // let cameraType = new CameraTypeModel(data);
        data.id = uuidv1();
        let success = false;
        await CameraTypeModel.create(data,function (err,cameraType) {
            if(!err) {
                success = true;
                logger.info('添加摄像头类型['+ cameraType.name +']成功');
            }else{
                logger.error(err.message);
            }
        });

        return success;
    }

    /**
     * 根据条件删除摄像头类型
     * @param conditions 删除条件
     * @returns {Promise.<boolean>}删除成功返回true，否则返回false；
     */
    static async delete_cameraType(conditions) {
        let success = false;
        const result = await CameraTypeModel.remove(conditions,function (err,cameraType) {
            if(!err) {
                success = true;
                logger.info('删除摄像头类型['+ cameraType.ip +']成功');
            }else{
                logger.error(err.message);
            }
        });
        return success;
    }

    /**
     * 修改摄像头类型信息
     * @param conditions 修改条件
     * @param data 新的摄像头类型数据
     * @returns {Promise.<*>} 返回修改后的数据
     */
    static async edit_cameraType(conditions,data){
        let result = null;
        result = await CameraTypeModel.update(conditions,data).exec();
        return result;
    }

    /**
     * 根据条件查询符合条件的摄像头类型数量
     * @param conditions
     * @returns {Promise.<*>}
     */
    static async getTotal(conditions){
        return await CameraTypeModel.find(conditions).count();

    }


    /**
     * 查询所有摄像头类型
     * @returns {Promise.<*>}
     */
    static async findAll(sort){
        if(sort){
            return await CameraTypeModel.find().sort(sort);
        }else{
            return await CameraTypeModel.find();
        }

    }

    /**
     * 根据条件查询摄像头类型
     * @param conditions 查询条件
     * @param sort 排序
     * @param pagination 分页
     * @returns {Promise.<*>} 返回查询到的数据
     */
    static async find_cameraType(conditions,sort,pagination){
        let result = null;
        if(sort){

            if(pagination){
                result = await CameraTypeModel.find(conditions).skip(pagination.pageStart).limit(pagination.pageSize).sort(sort);
            }else{
                result = await CameraTypeModel.find().sort(sort);
            }
        }else{
            if(pagination){
                result = await CameraTypeModel.find(conditions).skip(pagination.pageStart).limit(pagination.pageSize);
            }else{
                result = await CameraTypeModel.find(conditions);
            }
        }

        return result;
    }

    /**
     * 根据ID查找摄像头类型信息
     * @param id
     * @returns {Promise.<*>}
     */
    static async find_one(id){
        return await CameraTypeModel.findOne({id:id});
    }

    /**
     * 获得ID最大值
     * @returns {Promise.<number>}
     */
    static async findMaxId(){
        const result = await CameraTypeModel.find().sort({id:-1}).limit(1);
        if(result && result.length > 0){
            return result[0]._doc.id;
        }else{
            return 0
        }
    }


    /**
     * 根据条件判断是否存在符合条件的摄像头类型
     * @param conditions 查询条件
     * @returns {Promise.<boolean>} 有符合条件的对象返回true，否则返回false
     */
    static async isExist(conditions){
        const result = await CameraTypeModel.find(conditions);
        if(result && result.length > 0){
            return true;
        }else{
            return false;
        }
    }

}

exports=module.exports=CameraTypeService;
//export default CameraTypeService;