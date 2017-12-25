import mongoose from 'mongoose';

const VendorSchema = new mongoose.Schema({

    id:{
        type:String,
        unique:true,
        isRequired:true,
        index:{unique:true}
    },

    vendorName:{
        type:String
    },
    vendorCode:{
        type:String,
        unique:true,
        isRequired:true,
        index:{unique:true}
    },
    telephone:{
        type:String
    },
    address:{
        type:String
    }

});

module.exports = mongoose.model('vendor', VendorSchema);