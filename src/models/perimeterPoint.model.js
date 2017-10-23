/**
 * Created by chen on 17-8-23.
 */
import mongoose from 'mongoose';
import validate from 'mongoose-validator';
import validator from 'validator';

const PerimeterPointSchema = new mongoose.Schema({

    //ID
    id:{
        type:String,
        unique:true,
        isRequired:true,
        index:{unique:true}
    },
    //名称
    name:{
        type:String
    },
    //图上对应坐标x坐标
    x:{
        type:Number
    },
    //图上坐标对应Y坐标
    y:{
        type:Number
    },
    //序号
    No:{
      type:Number
    },
    //图上位置
    mapPosition:{
        type:Number,
        isRequired:true
    },
    //实际距离
    realPosition:{
        type:Number
    },
    hostId:{
        type:String,
        isRequired:true
    }
});

module.exports = mongoose.model('PerimeterPoint', PerimeterPointSchema);