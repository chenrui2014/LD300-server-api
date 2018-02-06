'use strict';

/**
 * Created by chen on 17-8-22.
 */
//import mongoose from 'mongoose';
//import validate from 'mongoose-validator';
//import validator from 'validator';

var mongoose = require('mongoose');
var validate = require('mongoose-validator');
var _validator = require('validator');

var UserSchema = new mongoose.Schema({
    id: {
        type: String,
        unique: true,
        isRequired: true,
        index: { unique: true }
    },
    username: {
        type: String,
        unique: true,
        required: true,
        validator: validate({
            validator: 'isLength',
            arguments: [2, 15]
        }),
        index: { unique: true }
    },
    password: {
        type: String,
        required: true,
        validate: {
            validator: function validator(v) {
                if (this.isModified('password')) {
                    return _validator.isLength(v, { min: 6 });
                }
                return true;
            },

            message: '密码至少为６位'
        }
    },
    sex: {
        type: String,
        enum: ['M', 'F']
    },
    address: {
        type: String,
        validate: validate({ validator: 'isLength', arguments: [0, 128] })
    },
    email: {
        type: String,
        validate: validate({ validator: 'isEmail', passIfEmpty: true })
    },
    salt: String
}, {
    timestamps: true,
    versionKey: false
});

UserSchema.virtual('profile').get(function () {
    return {
        _id: this.id,
        username: this.username,
        sex: this.sex,
        email: this.email,
        address: this.address
    };
});

UserSchema.virtual('info').get(function () {
    return {
        _id: this.id,
        username: this.username
    };
});

module.exports = mongoose.model('User', UserSchema);
//# sourceMappingURL=user.model.js.map