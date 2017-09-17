'use strict';

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _mongooseValidator = require('mongoose-validator');

var _mongooseValidator2 = _interopRequireDefault(_mongooseValidator);

var _validator = require('validator');

var _validator2 = _interopRequireDefault(_validator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var HostSchema = new _mongoose2.default.Schema({

    id: {
        type: String,
        unique: true,
        isRequired: true,
        index: { unique: true }
    },

    hostName: {
        type: String,
        isRequired: true,
        unique: true,
        index: { unique: true }
    },
    alias: {
        type: String
    },
    port: {
        type: String,
        isRequired: true
    }
}); /**
     * Created by chen on 17-8-23.
     */


module.exports = _mongoose2.default.model('Host', HostSchema);
//# sourceMappingURL=host.model.js.map