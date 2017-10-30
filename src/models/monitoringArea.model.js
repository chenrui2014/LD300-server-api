/**
 * Created by chen on 17-8-23.
 */
import mongoose from 'mongoose';
import validate from 'mongoose-validator';
import validator from 'validator';

const MonitoringAreaSchema = new mongoose.Schema({

    id:{//监控区域ID
        type:String,
        unique:true,
        isRequired:true,
        index:{unique:true}
    },
    hostId:{//关联主机ID
        type:mongoose.Schema.Types.ObjectId
    },
    mointors:[{//监控区域
        id:mongoose.Schema.Types.ObjectId,//摄像头编号
        min:Number,//监控距离始(实际单位米）
        max:Number,//监控距离末（实际单位米）
        presets:[{//预置点，即云台的位置和监控距离的关系，用于监控位置报警时根据预置点(x,y,zoom)移动云台到指定位置，枪机无效
            x:Number,//x坐标
            y:Number,//y坐标
            z:Number,//zoom缩放，ptz是三轴操作设备，提供x、y、zoom三轴，另外一个操作是调焦，一般支持自动对焦，不做设置
            preset:String,//预置点名称，有的摄像头支持根据名称快速对焦，因为怎么的xyz是要换算的，所以使用度不高，先不做设置
            distance:Number//监控距离（实际单位米），注意监控距离应该包含在外部的[min,max]之间,请保证数据的有效性
        }]
    }]
});

module.exports = mongoose.model('Monitoring', MonitoringAreaSchema);