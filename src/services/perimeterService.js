//import logger from '../logger';
//import PerimeterModel from '../models/perimeter.model';
//import uuidv1 from 'uuid/v1';

const {Parser}=require('../log/log');
const logger={};
Parser(logger,'PerimeterService.js');
const PerimeterModel=require('../models/perimeter.model');
const uuidv1=require('uuid/v1');

class PerimeterService {
    /**
     * 添加一个周界
     * @param data 需要添加的周界数据
     * @returns {Promise.<boolean>} 添加成功返回true，否则返回false；
     */
    static async add_perimeter(data){
        // const id = await PerimeterService.findMaxId();
        // data.id = Number(id) + 1;
        // let perimeter = new PerimeterModel(data);
        data.id = uuidv1();
        let perimeterId=null;
        await PerimeterModel.create(data,function (err,perimeter) {
            if(!err) {
                perimeterId = perimeter._doc.id;
                logger.info('添加周界成功');
            }else{
                logger.error(err.message);
            }
        });

        return perimeterId;
    }

    /**
     * 根据条件删除周界
     * @param conditions 删除条件
     * @returns {Promise.<boolean>}删除成功返回true，否则返回false；
     */
    static async delete_perimeter(conditions) {
        let success = false;
        const result = await PerimeterModel.remove(conditions,function (err,perimeter) {
            if(!err) {
                success = true;
                logger.info('删除周界['+ perimeter.realPosition +']成功');
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
    static async edit_perimeter(conditions,data){
        let result = null;
        result = await PerimeterModel.update(conditions,data).exec();
        return result;
    }

    /**
     * 根据条件查询符合条件的周界数量
     * @param conditions
     * @returns {Promise.<*>}
     */
    static async getTotal(conditions){
        return await PerimeterModel.find(conditions).count();

    }


    /**
     * 查询所有周界
     * @returns {Promise.<*>}
     */
    static async findAll(sort){
        if(sort){
            return await PerimeterModel.find().sort(sort);
        }else{
            return await PerimeterModel.find();
        }

    }

    /**
     * 根据条件查询周界
     * @param conditions 查询条件
     * @param sort 排序
     * @param pagination 分页
     * @returns {Promise.<*>} 返回查询到的数据
     */
    static async find_perimeter(conditions,sort,pagination){
        let result = null;
        if(sort){

            if(pagination){
                result = await PerimeterModel.find(conditions).skip(pagination.pageStart).limit(pagination.pageSize).sort(sort);
            }else{
                result = await PerimeterModel.find().sort(sort);
            }
        }else{
            if(pagination){
                result = await PerimeterModel.find(conditions).skip(pagination.pageStart).limit(pagination.pageSize);
            }else{
                result = await PerimeterModel.find(conditions);
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
        return await PerimeterModel.findOne({id:id});
    }

    /**
     * 获得ID最大值
     * @returns {Promise.<number>}
     */
    static async findMaxId(){
        const result = await PerimeterModel.find().sort({id:-1}).limit(1);
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
        const result = await PerimeterModel.find(conditions);
        if(result && result.length > 0){
            return true;
        }else{
            return false;
        }
    }

}

exports=module.exports=PerimeterService;