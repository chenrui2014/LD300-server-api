/**
 * 操作摄像头数据对象
 * Created by chen on 17-8-23.
 */
import logger from '../logger';
import CameraModel from '../models/camera.model';
import CameraTypeModel from "../models/cameraType.model";
// import uuidv1 from 'uuid/v1';
class CameraService {

    /**
     * 添加一个摄像头
     * @param data 需要添加的摄像头数据
     * @returns {Promise.<boolean>} 添加成功返回true，否则返回false；
     */
    static async add_camera(data){
        const id = await CameraService.findMaxId();
        // data.id = uuidv1();
        data.id = id + 1;
        //let camera = new CameraModel(data);
        let success = false;
        await CameraModel.create(data,function (err,camera) {
            if(!err) {
                success = true;
                logger.info('添加摄像头['+ camera.ip +']成功');
            }else{
                logger.error(err.message);
            }
        });
        // await camera.save(function (err,camera) {
        //     if(!err) {
        //         success = true;
        //         logger.info('添加摄像头['+ camera.ip +']成功');
        //     }else{
        //         logger.error(err.message);
        //     }
        // });

        return success;
    }

    /**
     * 根据条件删除摄像头
     * @param conditions 删除条件
     * @returns {Promise.<boolean>}删除成功返回true，否则返回false；
     */
    static async delete_camera(conditions) {
        let success = false;
        const result = await CameraModel.remove(conditions,function (err,camera) {
            if(!err) {
                success = true;
                logger.info(camera);
                logger.info('删除摄像头['+ camera.ip +']成功');
            }else{
                logger.error(err.message);
            }
        });
        return success;
    }

    /**
     * 修改摄像头信息
     * @param conditions 修改条件
     * @param data 新的摄像头数据
     * @returns {Promise.<*>} 返回修改后的数据
     */
    static async edit_camera(conditions,data){
        let result = null;
        result = await CameraModel.update(conditions,data).exec();
        return result;
    }

    /**
     * 根据条件查询符合条件的摄像头数量
     * @param conditions
     * @returns {Promise.<*>}
     */
    static async getTotal(conditions){
        return await CameraModel.find(conditions).count();

    }


    /**
     * 查询所有摄像头
     * @returns {Promise.<*>}
     */
    static async findAll(sort){
        if(sort){
            return await CameraModel.find().sort(sort);
        }else{
            return await CameraModel.find();
        }

    }

    /**
     * 根据条件查询摄像头
     * @param conditions 查询条件
     * @param sort 排序
     * @param pagination 分页
     * @returns {Promise.<*>} 返回查询到的数据
     */
    static async find_camera(conditions,sort,pagination){
        let result = null;
        if(sort){

            if(pagination){
                result = await CameraModel.find(conditions).skip(pagination.pageStart).limit(pagination.pageSize).sort(sort);
            }else{
                result = await CameraModel.find().sort(sort);
            }
        }else{
            if(pagination){
                result = await CameraModel.find(conditions).skip(pagination.pageStart).limit(pagination.pageSize);
            }else{
                result = await CameraModel.find(conditions);
            }
        }

        return result;
    }
    /**
     * 获得ID最大值
     * @returns {Promise.<number>}
     */
    static async findMaxId(){
        const result = await CameraModel.find().sort({id:-1}).limit(1);
        if(result && result.length > 0){
            return result[0]._doc.id;
        }else{
            return 0
        }
    }

    /**
     * 根据ID查找摄像头信息
     * @param id
     * @returns {Promise.<*>}
     */
    static async find_one(id){
        return await CameraModel.findOne({id:id});
    }

    /**
     * 根据条件判断是否存在符合条件的摄像头
     * @param conditions 查询条件
     * @returns {Promise.<boolean>} 有符合条件的对象返回true，否则返回false
     */
    static async isExist(conditions){
        const result = await CameraModel.find(conditions);
        if(result && result.length > 0){
            return true;
        }else{
            return false;
        }
    }

}

exports=module.exports=CameraService;
//export default CameraService;