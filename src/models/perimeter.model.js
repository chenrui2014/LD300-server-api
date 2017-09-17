/**
 * Created by chen on 17-8-23.
 */
import mongoose from 'mongoose';
import validate from 'mongoose-validator';
import validator from 'validator';

const PerimeterSchema = new mongoose.Schema({

    id:{
        type:String,
        unique:true,
        isRequired:true,
        index:{unique:true}
    },
    name:{
        type:String,
        isRequired:true,
        unique:true,
        index:{ unique: true }
    },
    status:{
        type:String
    }
});

module.exports = mongoose.model('Perimeter', PerimeterSchema);