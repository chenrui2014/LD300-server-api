import mongoose from 'mongoose';

const CameraTypeSchema = new mongoose.Schema({

    id:{
        type:Number,
        unique:true,
        isRequired:true,
        index:{unique:true}
    },

    typeName:{
        type:String
    },
    typeCode:{
        type:String
    }

});

module.exports = mongoose.model('cameraType', CameraTypeSchema);