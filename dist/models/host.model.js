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
        type: Number,
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
    port: { //串口连接串，window和linux下好像不相同
        type: String,
        isRequired: true
    },
    status: { //主机状态，0=正常；1=主机预警；2=未启用；3=主机故障
        type: Number
    }
}); /**
     * Created by chen on 17-8-23.
     */


module.exports = _mongoose2.default.model('Host', HostSchema);
//# sourceMappingURL=host.model.js.map