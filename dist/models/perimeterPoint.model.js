'use strict';

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _mongooseValidator = require('mongoose-validator');

var _mongooseValidator2 = _interopRequireDefault(_mongooseValidator);

var _validator = require('validator');

var _validator2 = _interopRequireDefault(_validator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var PerimeterPointSchema = new _mongoose2.default.Schema({

    //ID
    id: {
        type: String,
        unique: true,
        isRequired: true,
        index: { unique: true }
    },
    //名称
    name: {
        type: String
    },
    //图上对应坐标x坐标
    x: {
        type: Number
    },
    //图上坐标对应Y坐标
    y: {
        type: Number
    },
    //序号
    No: {
        type: Number
    },
    //图上位置
    mapPosition: {
        type: Number
    },
    //实际距离
    realPosition: {
        type: Number,
        unique: true,
        isRequired: true
    },
    hostId: {
        type: Number,
        isRequired: true
    }
}); /**
     * Created by chen on 17-8-23.
     */


module.exports = _mongoose2.default.model('PerimeterPoint', PerimeterPointSchema);
//# sourceMappingURL=perimeterPoint.model.js.map