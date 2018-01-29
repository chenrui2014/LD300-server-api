const mongoose =require('mongoose');
const EventVideoSchema = new mongoose.Schema({

    id:{
        type:String,
        unique:true,
        isRequired:true,
        index:{unique:true}
    },

    eventId:{//事件ID
        type:String
    },
    pid:{//摄像头ID
        type:String
    },
    path:{type:String},//路径
});

module.exports = mongoose.model('EventVideo', EventVideoSchema);