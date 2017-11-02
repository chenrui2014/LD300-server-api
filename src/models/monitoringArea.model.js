/**
 * Created by chen on 17-8-23.
 */
import mongoose from 'mongoose';
import validate from 'mongoose-validator';
import validator from 'validator';

const PresetSchema = new mongoose.Schema({
    id:{//ID
        type:String,
        unique:true,
        isRequired:true,
        index:{unique:true}
    },
    monitorId:Number,//监控区域ID
    x:Number,//x坐标
    y:Number,//y坐标
    z:Number,//zoom缩放，ptz是三轴操作设备，提供x、y、zoom三轴，另外一个操作是调焦，一般支持自动对焦，不做设置
    preset:String,//预置点名称，有的摄像头支持根据名称快速对焦，因为怎么的xyz是要换算的，所以使用度不高，先不做设置
    distance:Number//监控距离（实际单位米），注意监控距离应该包含在外部的[min,max]之间,请保证数据的有效性
});

const MonitoringAreaSchema = new mongoose.Schema({

    id:{//监控区域ID
        type:Number,
        unique:true,
        isRequired:true,
        index:{unique:true}
    },
    hostId:Number,//关联主机ID
    cameraId:Number,//摄像头编号
    min_dis:Number,//监控距离始(实际单位米）
    max_dis:Number,//监控距离末（实际单位米）
});
export const Preset = mongoose.model('Preset', PresetSchema);
export const Monitoring = mongoose.model('Monitoring', MonitoringAreaSchema);