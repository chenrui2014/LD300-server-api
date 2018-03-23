
/**
 * Created by chen on 17-8-23.
 */
const {Parser}=require('../log/log');
const logger={};
Parser(logger,'UserController.js');
const md5 = require("md5");
const UserModel = require("../models/user.model");
const UserService = require("../services/userService");
class UserController {
    static async add_user(ctx){
        const data = ctx.request.body;
        logger.info(data);

        if(!data) return ctx.error={ msg: '发送数据失败!' };
        const isExist = await UserService.isExist({userCode:data.userCode});
        //const isExist = await UserModel.findOne({ip:data.ip});

        if(isExist) return ctx.error={ msg: '用户编码为[' + data.userCode + ']的用户已存在!' };

        const result = await UserService.add_user(data);

        let msg = '';
        if(result) {
            msg = '添加用户'+ data.userCode +'成功';
            return ctx.body = {msg:msg,data:data};
        }else{
            msg = '添加失败';
            return ctx.error={msg: msg};
        }

    }

    static async delete_user(ctx) {
        const { id } = ctx.params;
        const result = await UserService.delete_user({id:id});
        let msg = '';
        if(result) {
            msg = '删除用户成功';
            return ctx.body = {msg:msg,data:result};
        }else{
            msg = '删除用户失败';
            return ctx.error={msg: msg};
        }

    }

    static async edit_user(ctx){
        const data = ctx.request.body;
        logger.info(data);
        let _id = data._id;
        delete data._id;
        const result = await UserService.edit_user({_id:_id},data);
        if(result) return ctx.body = {msg:'修改用户成功',data:result};
        return ctx.error={msg: '修改用户失败!'};
    }

    static async find_user(ctx){
        const { sort,range,filter } = ctx.query;
        let sortObj = null;
        if(sort){
            sortObj = JSON.parse(sort);
        }

        let rangeObj = null;
        if(range){
            rangeObj = JSON.parse(range);
        }

        let filterObj = null;
        if(filter && "{}" !==filter){
            let obj = JSON.parse(filter);
            if(obj && Array.isArray(obj.id)){
                filterObj = {id:{$in:obj.id}};
            }else{
                filterObj = obj;
            }
        }

        let sortP = {};
        if(sortObj && sortObj.length >=2){
            if('ASC' ===sortObj[1]){
                sortP[sortObj[0]] = 1
            }else{
                sortP[sortObj[0]] = -1
            }
        }

        let pageStart = 0,pageEnd = 0;
        if(rangeObj && rangeObj.length >=2){
            pageStart = rangeObj[0];
            pageEnd = rangeObj[1];
        }

        const total = await UserService.getTotal();

        const pagination = {};
        pagination.pageStart = pageStart;
        pagination.pageSize = pageEnd-pageStart+1;
        let result = null;
        if(sortP){
            if(rangeObj){
                let pageStart = 0,pageEnd = 0;
                if(rangeObj && rangeObj.length >=2){
                    pageStart = rangeObj[0];
                    pageEnd = rangeObj[1];
                }
                const pagination = {};
                pagination.pageStart = pageStart;
                pagination.pageSize = pageEnd-pageStart+25;
                result = await UserService.find_user(filterObj,sortP,pagination);
            }else{
                result = await UserService.find_user(filterObj,sortP);
            }
        }else{
            if(rangeObj){
                let pageStart = 0,pageEnd = 0;
                if(rangeObj && rangeObj.length >=2){
                    pageStart = rangeObj[0];
                    pageEnd = rangeObj[1];
                }
                const pagination = {};
                pagination.pageStart = pageStart;
                pagination.pageSize = pageEnd-pageStart+25;
                result = await UserService.find_user(filterObj,null,pagination);
            }else{
                result = await UserService.find_user(filterObj);
            }
        }
        // let result = await UserService.find_user(filterObj,sortP,pagination);
        if(result) return ctx.body = {msg:'查询用户',data:result,total:total};
        return ctx.error={msg: '没有找到用户!'};
    }

    static async find_user_noPage(ctx){
        const { sort} = ctx.query;
        let sortObj = JSON.parse(sort);
        let sortP = {};
        if(sortObj && sortObj.length >=2){
            if('ASC' ===sortObj[1]){
                sortP[sortObj[0]] = 1
            }else{
                sortP[sortObj[0]] = -1
            }
        }
        let result = await UserService.findAll(sortP);
        if(result) return ctx.body = {msg:'查询用户',data:result};
        return ctx.error={msg: '没有找到用户!'};
    }

    static async find_one(ctx){
        const { id } = ctx.params;
        const result = await UserService.find_one(id);
        if(result) ctx.body = {msg:'查询用户',data:result};
        return ctx.error = {msg: '没有找到用户!'};
    }

    // 添加用户
    static async create_user(ctx){
        const { username, email, password } = ctx.request.body;
        if(!name||!password) return ctx.render('error',{
            message: '用户或密码不能为空!',
            error: { status:400 }
        });
        const isexit = await UserService.find_user({username,password: md5(password)});
        if(isexit && isexit.length > 0) return ctx.render('error',{
            message: '该用户已存在!',
            error: { status:400 }
        });
        /*const result = */await UserService.add_user({username,email,password: md5(password)});
        ctx.redirect('/');
    }

    // 用户登录
    static async signIn(ctx) {
        const { username, password } = ctx.request.body;
        try {
            let user = await UserService.find_user({username:username,password:md5(password)});
            logger.info(user);
            if(user && user.length > 0){
                return ctx.body={status:"success",data:user[0].username}
            }
        } catch (err){
            logger.error("登录失败");
            return ctx.body={status:"failed",err:err}
        }
    }

    // 用户退出
    static async signOut(ctx) {
        const { username} = ctx.request.body;
        try {
            let user = await UserService.find_user({username:username});
            logger.info(user);
            if(user && user.length > 0) {
                return ctx.body = JSON.stringify({status: "success", data: user});
            }
        }catch(err) {
            logger.error('err', err);
            ctx.status = 500;  //状态 500
            ctx.body =  JSON.stringify({status: 'failed'}) //返回错误状态
        }
    }

}

export default UserController;