//import mongoose from 'mongoose';
const mongoose =require('mongoose');

const UserSchema = new mongoose.Schema({

    id:{
        type:String,
        unique:true,
        isRequired:true,
        index:{unique:true}
    },

    username:{
        type:String,
        isRequired:true,
    },
    password:{
        type:String,
        isRequired:true,
    },
    role:{
        type:String,
        isRequired:true,
        default:"test"
    }

});

module.exports = mongoose.model('user', UserSchema);