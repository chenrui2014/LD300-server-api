/**
 * Created by chen on 17-8-23.
 */
import mongoose from 'mongoose';
import validate from 'mongoose-validator';
import validator from 'validator';

const MonitoringAreaSchema = new mongoose.Schema({

    id:{
        type:String,
        unique:true,
        isRequired:true,
        index:{unique:true}
    },

    camera:{
        type:String,
        isRequired:true,
        unique:true,
        index:{ unique: true }
    },
    monitoryPoint:{
        type:String
    },
    presetPoint:{
        type:String
    },
    operation:{
        type:String
    }
});

module.exports = mongoose.model('Monitoring', MonitoringAreaSchema);