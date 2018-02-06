'use strict';

//import mongoose from 'mongoose';
var mongoose = require('mongoose');

var VendorSchema = new mongoose.Schema({

    id: {
        type: String,
        unique: true,
        isRequired: true,
        index: { unique: true }
    },

    vendorName: {
        type: String
    },
    vendorCode: {
        type: String,
        unique: true,
        isRequired: true,
        index: { unique: true }
    },
    telephone: {
        type: String
    },
    address: {
        type: String
    }

});

module.exports = mongoose.model('vendor', VendorSchema);
//# sourceMappingURL=vendor.model.js.map