/**
 * Created by chen on 17-8-23.
 */
import mongoose from 'mongoose';
import validate from 'mongoose-validator';
import validator from 'validator';

const PerimeterPointSchema = new mongoose.Schema({

    id:{
        type:String,
        unique:true,
        isRequired:true,
        index:{unique:true}
    },
    mapPosition:{
        type:Number,
        isRequired:true,
        unique:true,
        index:{ unique: true }
    },
    realPosition:{
        type:Number
    }
});

module.exports = mongoose.model('PerimeterPoint', PerimeterPointSchema);