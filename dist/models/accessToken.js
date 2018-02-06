'use strict';

//import mongoose from 'mongoose';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var duration = 60 * 60 * 24 * 7; // 7days
var ObjectId = Schema.Types.ObjectId;

var TokenSchema = new Schema({
    token: {
        type: String,
        unique: true,
        required: true
    },
    user: {
        type: ObjectId,
        ref: 'Users',
        required: true
    },
    createAt: {
        type: Date,
        default: Date.now(),
        expires: duration
    }
});

// 过期时间
TokenSchema.virtual('expiresAt').get(function () {
    return new Date(this.createAt.getTime() + duration * 1000);
});

// 剩余时间
TokenSchema.virtual('expiresIn').get(function () {
    return Number.parseInt((this.expiresAt - Date.now()) / 1000, 10);
});

module.exports = mongoose.model('Tokens', TokenSchema);
//# sourceMappingURL=accessToken.js.map