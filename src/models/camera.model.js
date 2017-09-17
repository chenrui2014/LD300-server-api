/**
 * Created by chen on 17-8-23.
 */
import mongoose from 'mongoose';
import validate from 'mongoose-validator';
import validator from 'validator';

const CameraSchema = new mongoose.Schema({

    id:{
        type:String,
        unique:true,
        isRequired:true,
        index:{unique:true}
    },

    name:{
        type:String
    },
    ip:{
        type:String,
        isRequired:true,
        unique:true,
        index:{unique:true}
    },
    type:{
      type:String,
    },
    manufacturer:{
        type:String
    },
    Video_protocol:{
        type:String
    },
    talkBack:{
        type:Boolean
    },
    yunTai_protocol:{
        type:String
    },
    status:{
        type:Boolean
    }

});

module.exports = mongoose.model('Camera', CameraSchema);