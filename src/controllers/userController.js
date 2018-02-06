/**
 * Created by chen on 17-8-22.
 */
// import mongoose from 'mongoose';
import md5 from 'md5';
const {Parser}=require('../log/log');
const logger={};
Parser(logger,'UserController.js');
import UserModel from '../models/user.model';
import TokenModel from '../models/accessToken';

import {getHash} from '../utils';
import admin from '../config/admin';


class UserController {
    static async signToken (ctx, next) {
        const { user } = ctx.req;
        await TokenModel.findOneAndRemove({user: user._id});
        const result = await TokenModel.create({
            token: genHash(user.username + Date.now()),
            user: user._id
        });

        ctx.status = 200;
        ctx.body = {
            success: true,
            data: result
        }
    }

    static async getUserByToken (ctx, next) {
        ctx.status = 200;
        ctx.body = {
            success: true,
            data: ctx.req.user
        }
    }

    // 当数据库中user表示空的时候，创建超级管理员
    static async seed (ctx, next) {
        const users = await UserModel.find({});
        if (users.length === 0) {
            const _admin = new UserModel(admin);
            /*const adminUser = */await _admin.save()
        }
    }


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
        /*const result = */await AdminUserModel.create({name,email,password: md5(password)});
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
            logger.error("登录失败");
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
            logger.error('err', err);
            ctx.status = 500;  //状态 500
            ctx.body =  JSON.stringify({status: 'failed'}) //返回错误状态
        }
        //return ;
    }
}

export default UserController;