'use strict';

/**
 * Created by chen on 17-8-23.
 */
//import mongoose from 'mongoose';
var mongoose = require('mongoose');

var PerimeterSchema = new mongoose.Schema({

    id: {
        type: String,
        unique: true,
        isRequired: true,
        index: { unique: true }
    },
    name: {
        type: String
    },
    status: {
        type: String
    }
});

module.exports = mongoose.model('Perimeter', PerimeterSchema);
//# sourceMappingURL=perimeter.model.js.map