'use strict';

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _mongooseValidator = require('mongoose-validator');

var _mongooseValidator2 = _interopRequireDefault(_mongooseValidator);

var _validator2 = require('validator');

var _validator3 = _interopRequireDefault(_validator2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var UserSchema = new _mongoose2.default.Schema({
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
        validator: (0, _mongooseValidator2.default)({
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
                    return _validator3.default.isLength(v, { min: 6 });
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
        validate: (0, _mongooseValidator2.default)({ validator: 'isLength', arguments: [0, 128] })
    },
    email: {
        type: String,
        validate: (0, _mongooseValidator2.default)({ validator: 'isEmail', passIfEmpty: true })
    },
    salt: String
}, {
    timestamps: true,
    versionKey: false
}); /**
     * Created by chen on 17-8-22.
     */


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

module.exports = _mongoose2.default.model('User', UserSchema);
//# sourceMappingURL=user.model.js.map