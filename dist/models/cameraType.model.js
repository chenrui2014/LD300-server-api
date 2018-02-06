'use strict';

//import mongoose from 'mongoose';
var mongoose = require('mongoose');

var CameraTypeSchema = new mongoose.Schema({

    id: {
        type: String,
        unique: true,
        isRequired: true,
        index: { unique: true }
    },

    typeName: {
        type: String
    },
    typeCode: {
        type: String,
        unique: true,
        isRequired: true,
        index: { unique: true }
    }

});

module.exports = mongoose.model('cameraType', CameraTypeSchema);
//# sourceMappingURL=cameraType.model.js.map