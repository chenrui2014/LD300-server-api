/**
 * Created by chen on 17-8-23.
 */
//import mongoose from 'mongoose';
const mongoose=require('mongoose');

const PerimeterSchema = new mongoose.Schema({

    id:{
        type:String,
        unique:true,
        isRequired:true,
        index:{unique:true}
    },
    name:{
        type:String
    },
    status:{
        type:String
    }
});

module.exports = mongoose.model('Perimeter', PerimeterSchema);