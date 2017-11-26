/**
 * Created by chen on 17-8-23.
 */
const mongoose =require('mongoose');
//import mongoose from 'mongoose';
//import validate from 'mongoose-validator';
//import validator from 'validator';

const CameraSchema = new mongoose.Schema({

    id:{
        type:Number,
        unique:true,
        isRequired:true,
        index:{unique:true}
    },

    name:{//摄像头名称
        type:String
    },
    ip:{//摄像头IP
        type:String,
        isRequired:true,
        unique:true,
        index:{unique:true}
    },
    port:{//摄像头端口
        type:Number,
        isRequired:true
    },
    user:{type:String,default:"admin"},//摄像头用户名
    pwd:{type:String,default:"admin"},//摄像头密码
    ptz:Boolean,//是否有云台功能，即是否是球机
    alarm:{type:Boolean},//支持报警输出
    audio:{type:Boolean},//支持音频对讲
    type:{//摄像头类型
      type:String,
    },
    brand:{//生产厂商
        type:String
    },
    onvif_port:{type:Number},//协议端口
    onvif_user:{type:String},
    onvif_pwd:{type:String},
    onvif_path:{type:String},//服务地址，先不用填，基本都是标准地址
    status:{//摄像头状态，在线，离线
        type:Boolean
    }

});

module.exports = mongoose.model('Camera', CameraSchema);