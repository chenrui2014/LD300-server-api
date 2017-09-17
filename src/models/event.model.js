/**
 * Created by chen on 17-8-23.
 */
import mongoose from 'mongoose';
import validate from 'mongoose-validator';
import validator from 'validator';

const EventSchema = new mongoose.Schema({

    id:{
        type:String,
        unique:true,
        isRequired:true,
        index:{unique:true}
    },

    happenTime:{
        type:Date,
        isRequired:true
    },
    position:{
        type:String,
        isRequired:true
    },
    eventType:{
        type:String,
        isRequired:true
    },
    eventHandler:{
        type:String
    },
    eventRecord:{
        type:String
    }
});

module.exports = mongoose.model('Event', EventSchema);