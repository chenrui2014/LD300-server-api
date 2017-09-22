/**
 * Created by chen on 17-8-22.
 */
// import mongoose from 'mongoose';
import md5 from 'md5';
import logger from '../logger';

import UserModel from '../models/user.model';


class UserController {
    // 添加用户
    static async create_user(ctx){
        const { name, email, password } = ctx.request.body;
        if(!name||!password) return ctx.render('error',{
            message: '用户或密码不能为空!',
            error: { status:400 }
        });
        const isexit = await UserModel.findOne({name,password: md5(password)});
        if(isexit) return ctx.render('error',{
            message: '该用户已存在!',
            error: { status:400 }
        });
        const result = await AdminUserModel.create({name,email,password: md5(password)});
        ctx.redirect('/');
    }

    // 用户登录
    static async signIn(ctx) {
        const { name, password } = ctx.request.body;
        try {
            let user = await UserModel.findOne({username:name,password:md5(password)});
            logger.info(user);
            if(user){
                return ctx.body={status:"success",data:user}
            }
        } catch (err){
            logger.error("登录失败")
            return ctx.body={status:"failed",err:err}
        }
    }

    // 用户退出
    static async signOut(ctx) {
        try {
            let user = await UserModel.findOne({username:'chen',password:md5('chen')});
            logger.info(user);
            ctx.body = JSON.stringify({status:"success",data:user});
        }catch(err) {
            logger.error('err', err)
            ctx.status = 500  //状态 500
            ctx.body =  JSON.stringify({status: 'failed'}) //返回错误状态
        }
        return ;
    }
}

export default UserController;