'use strict';

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _mongooseValidator = require('mongoose-validator');

var _mongooseValidator2 = _interopRequireDefault(_mongooseValidator);

var _validator = require('validator');

var _validator2 = _interopRequireDefault(_validator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var CameraSchema = new _mongoose2.default.Schema({

    id: {
        type: String,
        unique: true,
        isRequired: true,
        index: { unique: true }
    },

    name: {
        type: String
    },
    ip: {
        type: String,
        isRequired: true,
        unique: true,
        index: { unique: true }
    },
    type: {
        type: String
    },
    manufacturer: {
        type: String
    },
    Video_protocol: {
        type: String
    },
    talkBack: {
        type: Boolean
    },
    yunTai_protocol: {
        type: String
    },
    status: {
        type: Boolean
    }

}); /**
     * Created by chen on 17-8-23.
     */


module.exports = _mongoose2.default.model('Camera', CameraSchema);
//# sourceMappingURL=camera.model.js.map