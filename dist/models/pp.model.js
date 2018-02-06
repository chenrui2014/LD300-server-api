'use strict';

//import mongoose from 'mongoose';
var mongoose = require('mongoose');

var PpSchema = new mongoose.Schema({
    id: {
        type: String,
        unique: true,
        isRequired: true,
        index: { unique: true }
    },
    name: {
        type: String
    },
    pp: [{ x: {
            type: Number
        }, y: {
            type: Number
        }, No: {
            type: Number
        }, mapPosition: {
            type: Number
        }, realPosition: {
            type: Number
        } }],
    status: {
        type: String
    }
});

module.exports = mongoose.model('pp', PpSchema);
//# sourceMappingURL=pp.model.js.map