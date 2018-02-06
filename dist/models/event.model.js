'use strict';

/**
 * Created by chen on 17-8-23.
 */
//import mongoose from 'mongoose';
var mongoose = require('mongoose');
var EventSchema = new mongoose.Schema({

    id: {
        type: String,
        unique: true,
        isRequired: true,
        index: { unique: true }
    },

    happenTime: { //发生时间
        type: String,
        isRequired: true
    },
    position: { //触警位置
        type: String
    },
    video: [{ pid: { type: Number }, path: { type: String } }],
    //pid:{type:Number},//关联摄像头
    hid: { type: String }, //关联主机
    //path:{type:String},//录像存放路径
    eventType: { //事件类型
        type: String
    },
    eventHandler: { //事件处理人
        type: String
    }
});

module.exports = mongoose.model('Event', EventSchema);
//# sourceMappingURL=event.model.js.map