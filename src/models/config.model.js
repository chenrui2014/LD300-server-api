import mongoose from 'mongoose';

const ConfigSchema = new mongoose.Schema({
    id:{
        type:String,
        unique:true,
        isRequired:true,
        index:{unique:true}
    },
    sysName:{//系统名称
        type:String
    },
    company:{//公司名称
        type:String
    },
    telephone:{//公司电话
        type:String
    },

    configDate:{//配置日期
        type:Date
    },
    useUnit:{//使用单位
        type:String
    }

});

module.exports = mongoose.model('config', ConfigSchema);