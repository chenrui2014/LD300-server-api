import mongoose from 'mongoose';

const UnitSchema = new mongoose.Schema({

    id:{
        type:Number,
        unique:true,
        isRequired:true,
        index:{unique:true}
    },

    sysName:{
        type:String
    },
    company:{
        type:String
    },
    telephone:{
        type:String
    },
    configDate:{
        type:Date
    }

});

module.exports = mongoose.model('Unit', UnitSchema);