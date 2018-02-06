'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Created by Luky on 2017/10/21.
 */
var config = global.server_config || require('../../config/config');
var _ = require('lodash');
var path = require('path');
var file = _.get(config, 'runMode.interfaces', '');
if (file) file = path.resolve(config.root, 'app/servers/interfaces', file);

var _Received = {
    'clear': 'clear',
    'unKnown': 'unKnown'
};

var CmdFormatter = function () {
    function CmdFormatter() {
        _classCallCheck(this, CmdFormatter);
    }

    _createClass(CmdFormatter, [{
        key: 'formatHostStateChanged',

        //hid,type,stateNew,position
        value: function formatHostStateChanged(index, hostEvt) {
            throw new Error('未实现接口hostStateChanged');
        }
    }, {
        key: 'formatReceived',
        value: function formatReceived(cmd) {
            throw new Error('未实现接口receive');
        }
    }], [{
        key: 'CmdReceived',
        get: function get() {
            return _Received;
        }
    }]);

    return CmdFormatter;
}();

exports = module.exports = CmdFormatter;
//# sourceMappingURL=cmd_formatter.js.map