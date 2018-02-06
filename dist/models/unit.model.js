'use strict';

//import mongoose from 'mongoose';
var mongoose = require('mongoose');

var UnitSchema = new mongoose.Schema({

    id: {
        type: Number,
        unique: true,
        isRequired: true,
        index: { unique: true }
    },

    sysName: {
        type: String
    },
    company: {
        type: String
    },
    telephone: {
        type: String
    },
    configDate: {
        type: Date
    }

});

module.exports = mongoose.model('Unit', UnitSchema);
//# sourceMappingURL=unit.model.js.map