/**
 * 操作用户数据对象
 * Created by chen on 17-8-23.
 */
//import logger from '../logger';
//import UserModel from '../models/user.model';
//import uuidv1 from 'uuid/v1';

const {Parser}=require('../log/log');
const logger={};
Parser(logger,'UserService.js');
const UserModel=require('../models/user.model');
const uuidv1=require('uuid/v1');
const md5 = require("md5");

class UserService {

    /**
     * 添加一个用户
     * @param data 需要添加的用户数据
     * @returns {Promise.<boolean>} 添加成功返回true，否则返回false；
     */
    static async add_user(data){
        // const id = await UserService.findMaxId();
        // data.id = Number(id) + 1;
        // let user = new UserModel(data);
        data.id = uuidv1();
        data.password = md5(data.password);
        let success = false;
        await UserModel.create(data,function (err,user) {
            if(!err) {
                success = true;
                logger.info('添加用户成功');
            }else{
                logger.error(err.message);
            }
        });


        return success;
    }

    /**
     * 根据条件删除用户
     * @param conditions 删除条件
     * @returns {Promise.<boolean>}删除成功返回true，否则返回false；
     */
    static async delete_user(conditions) {
        let success = false;
        const result = await UserModel.remove(conditions,function (err,user) {
            if(!err) {
                success = true;
            }else{
                logger.error(err.message);
            }
        });
        return success;
    }

    /**
     * 修改用户信息
     * @param conditions 修改条件
     * @param data 新的用户数据
     * @returns {Promise.<*>} 返回修改后的数据
     */
    static async edit_user(conditions,data){
        let result = null;
        result = await UserModel.update(conditions,data).exec();
        return result;
    }

    /**
     * 根据条件查询符合条件的用户数量
     * @param conditions
     * @returns {Promise.<*>}
     */
    static async getTotal(conditions){
        return await UserModel.find(conditions).count();

    }


    /**
     * 查询所有用户
     * @returns {Promise.<*>}
     */
    static async findAll(sort){
        if(sort){
            return await UserModel.find().sort(sort);
        }else{
            return await UserModel.find();
        }

    }

    /**
     * 根据条件查询用户
     * @param conditions 查询条件
     * @param sort 排序
     * @param pagination 分页
     * @returns {Promise.<*>} 返回查询到的数据
     */
    static async find_user(conditions,sort,pagination){
        let result = null;
        if(sort){

            if(pagination){
                result = await UserModel.find(conditions).skip(pagination.pageStart).limit(pagination.pageSize).sort(sort);
            }else{
                result = await UserModel.find().sort(sort);
            }
        }else{
            if(pagination){
                result = await UserModel.find(conditions).skip(pagination.pageStart).limit(pagination.pageSize);
            }else{
                result = await UserModel.find(conditions);
            }
        }

        return result;
    }

    /**
     * 根据ID查找用户信息
     * @param id
     * @returns {Promise.<*>}
     */
    static async find_one(id){
        return await UserModel.findOne({id:id});
    }

    /**
     * 获得ID最大值
     * @returns {Promise.<number>}
     */
    static async findMaxId(){
        const result = await UserModel.find().sort({id:-1}).limit(1);
        if(result && result.length > 0){
            return result[0]._doc.id;
        }else{
            return 0
        }
    }


    /**
     * 根据条件判断是否存在符合条件的用户
     * @param conditions 查询条件
     * @returns {Promise.<boolean>} 有符合条件的对象返回true，否则返回false
     */
    static async isExist(conditions){
        const result = await UserModel.find(conditions);
        if(result && result.length > 0){
            return true;
        }else{
            return false;
        }
    }

}

exports=module.exports=UserService;
//export default UserService;