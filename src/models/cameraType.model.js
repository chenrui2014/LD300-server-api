//import mongoose from 'mongoose';
const mongoose =require('mongoose');

const CameraTypeSchema = new mongoose.Schema({

    id:{
        type:String,
        unique:true,
        isRequired:true,
        index:{unique:true}
    },

    typeName:{
        type:String
    },
    typeCode:{
        type:String,
        unique:true,
        isRequired:true,
        index:{unique:true}
    }

});

module.exports = mongoose.model('cameraType', CameraTypeSchema);