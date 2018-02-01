/**
 * 操作单位数据对象
 * Created by chen on 17-8-23.
 */
//import logger from '../logger';
//import UnitModel from '../models/unit.model';
const {Parser}=require('../log/log');
const logger={};
Parser('logger','UnitService.js')
const UnitModel=require('../models/unit.model');

class UnitService {

    /**
     * 添加一个单位
     * @param data 需要添加的单位数据
     * @returns {Promise.<boolean>} 添加成功返回true，否则返回false；
     */
    static async add_unit(data){
        const id = await UnitService.findMaxId();
        data.id = Number(id) + 1;
        // let unit = new UnitModel(data);
        let success = false;
        await UnitModel.create(data,function (err,unit) {
            if(!err) {
                success = true;
                logger.info('添加单位成功');
            }else{
                logger.error(err.message);
            }
        });

        return success;
    }

    /**
     * 根据条件删除单位
     * @param conditions 删除条件
     * @returns {Promise.<boolean>}删除成功返回true，否则返回false；
     */
    static async delete_unit(conditions) {
        let success = false;
        const result = await UnitModel.remove(conditions,function (err,unit) {
            if(!err) {
                success = true;
                logger.info('删除单位['+ unit.ip +']成功');
            }else{
                logger.error(err.message);
            }
        });
        return success;
    }

    /**
     * 修改单位信息
     * @param conditions 修改条件
     * @param data 新的单位数据
     * @returns {Promise.<*>} 返回修改后的数据
     */
    static async edit_unit(conditions,data){
        let result = null;
        result = await UnitModel.update(conditions,data).exec();
        return result;
    }

    /**
     * 根据条件查询符合条件的单位数量
     * @param conditions
     * @returns {Promise.<*>}
     */
    static async getTotal(conditions){
        return await UnitModel.find(conditions).count();

    }


    /**
     * 查询所有单位
     * @returns {Promise.<*>}
     */
    static async findAll(sort){
        if(sort){
            return await UnitModel.find().sort(sort);
        }else{
            return await UnitModel.find();
        }

    }

    /**
     * 根据条件查询单位
     * @param conditions 查询条件
     * @param sort 排序
     * @param pagination 分页
     * @returns {Promise.<*>} 返回查询到的数据
     */
    static async find_unit(conditions,sort,pagination){
        let result = null;
        if(sort){

            if(pagination){
                result = await UnitModel.find(conditions).skip(pagination.pageStart).limit(pagination.pageSize).sort(sort);
            }else{
                result = await UnitModel.find().sort(sort);
            }
        }else{
            if(pagination){
                result = await UnitModel.find(conditions).skip(pagination.pageStart).limit(pagination.pageSize);
            }else{
                result = await UnitModel.find(conditions);
            }
        }

        return result;
    }

    /**
     * 根据ID查找单位信息
     * @param id
     * @returns {Promise.<*>}
     */
    static async find_one(id){
        return await UnitModel.findOne({id:id});
    }

    /**
     * 获得ID最大值
     * @returns {Promise.<number>}
     */
    static async findMaxId(){
        const result = await UnitModel.find().sort({id:-1}).limit(1);
        if(result && result.length > 0){
            return result[0]._doc.id;
        }else{
            return 0
        }
    }


    /**
     * 根据条件判断是否存在符合条件的单位
     * @param conditions 查询条件
     * @returns {Promise.<boolean>} 有符合条件的对象返回true，否则返回false
     */
    static async isExist(conditions){
        const result = await UnitModel.find(conditions);
        if(result && result.length > 0){
            return true;
        }else{
            return false;
        }
    }

}

exports=module.exports=UnitService;
//export default UnitService;