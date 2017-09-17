'use strict';

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _mongooseValidator = require('mongoose-validator');

var _mongooseValidator2 = _interopRequireDefault(_mongooseValidator);

var _validator = require('validator');

var _validator2 = _interopRequireDefault(_validator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var EventSchema = new _mongoose2.default.Schema({

    id: {
        type: String,
        unique: true,
        isRequired: true,
        index: { unique: true }
    },

    happenTime: {
        type: Date,
        isRequired: true
    },
    position: {
        type: String,
        isRequired: true
    },
    eventType: {
        type: String,
        isRequired: true
    },
    eventHandler: {
        type: String
    },
    eventRecord: {
        type: String
    }
}); /**
     * Created by chen on 17-8-23.
     */


module.exports = _mongoose2.default.model('Event', EventSchema);
//# sourceMappingURL=event.model.js.map