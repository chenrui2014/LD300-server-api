/**
 * 操作摄像头数据对象
 * Created by chen on 17-8-23.
 */
import logger from '../logger';
import CamerasModel from '../models/cameras.model';
import uuidv1 from 'uuid/v1';
class CamerasService {

    /**
     * 添加一个摄像头
     * @param data 需要添加的摄像头数据
     * @returns {Promise.<boolean>} 添加成功返回true，否则返回false；
     */
    static async add_cameras(data){
        const id = await CamerasService.findMaxId();
        //data.id = uuidv1();
        //data.num = num+1;
         data.id = id + 1;
        //let cameras = new CamerasModel(data);
        let success = false;
        await CamerasModel.create(data,function (err,cameras) {
            if(!err) {
                success = true;
                logger.info('添加摄像头['+ cameras.ip +']成功');
            }else{
                logger.error(err.message);
            }
        });
        // await cameras.save(function (err,cameras) {
        //     if(!err) {
        //         success = true;
        //         logger.info('添加摄像头['+ cameras.ip +']成功');
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
    static async delete_cameras(conditions) {
        let success = false;
        const result = await CamerasModel.remove(conditions,function (err,cameras) {
            if(!err) {
                success = true;
                logger.info(cameras);
                logger.info('删除摄像头['+ cameras.ip +']成功');
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
    static async edit_cameras(conditions,data){
        let result = null;
        result = await CamerasModel.update(conditions,data).exec();
        return result;
    }

    /**
     * 根据条件查询符合条件的摄像头数量
     * @param conditions
     * @returns {Promise.<*>}
     */
    static async getTotal(conditions){
        return await CamerasModel.find(conditions).count();

    }


    /**
     * 查询所有摄像头
     * @returns {Promise.<*>}
     */
    static async findAll(sort){
        if(sort){
            return await CamerasModel.find().sort(sort);
        }else{
            return await CamerasModel.find();
        }

    }

    /**
     * 根据条件查询摄像头
     * @param conditions 查询条件
     * @param sort 排序
     * @param pagination 分页
     * @returns {Promise.<*>} 返回查询到的数据
     */
    static async find_cameras(conditions,sort,pagination){
        let result = null;
        if(sort){

            if(pagination){
                result = await CamerasModel.find(conditions).skip(pagination.pageStart).limit(pagination.pageSize).sort(sort);
            }else{
                result = await CamerasModel.find().sort(sort);
            }
        }else{
            if(pagination){
                result = await CamerasModel.find(conditions).skip(pagination.pageStart).limit(pagination.pageSize);
            }else{
                result = await CamerasModel.find(conditions);
            }
        }

        return result;
    }
    /**
     * 获得num最大值
     * @returns {Promise.<number>}
     */
    static async findMaxId(){
        const result = await CamerasModel.find().sort({id:-1}).limit(1);
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
        return await CamerasModel.findOne({id:id});
    }

    /**
     * 根据条件判断是否存在符合条件的摄像头
     * @param conditions 查询条件
     * @returns {Promise.<boolean>} 有符合条件的对象返回true，否则返回false
     */
    static async isExist(conditions){
        const result = await CamerasModel.find(conditions);
        if(result && result.length > 0){
            return true;
        }else{
            return false;
        }
    }

}

exports=module.exports=CamerasService;
//export default CamerasService;