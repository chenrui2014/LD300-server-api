//import mongoose from 'mongoose';
const mongoose =require('mongoose');

const PpSchema = new mongoose.Schema({
    id:{
        type:String,
        unique:true,
        isRequired:true,
        index:{unique:true}
    },
    name:{
        type:String
    },
    pp:[{x:{
            type:Number
        },y:{
            type:Number
        },No:{
            type:Number
        },mapPosition:{
            type:Number,
        },realPosition:{
            type:Number
        }}],
    status:{
        type:String
    }
});

module.exports = mongoose.model('pp', PpSchema);