/**
 * Created by chen on 17-8-23.
 */
import mongoose from 'mongoose';
import validate from 'mongoose-validator';
import validator from 'validator';

const HostSchema = new mongoose.Schema({

    id:{
        type:String,
        unique:true,
        isRequired:true,
        index:{unique:true}
    },

    hostName:{
        type:String,
        isRequired:true,
        unique:true,
        index:{ unique: true }
    },
    alias:{
        type:String
    },
    port:{
        type:String,
        isRequired:true
    }
});

module.exports = mongoose.model('Host', HostSchema);