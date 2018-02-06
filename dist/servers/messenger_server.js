'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Created by Luky on 2017/10/19
 */

var EventEmitter = require('events').EventEmitter;
var assert = require('assert');

var _Events = {
    newClient: 'newClient'
};

var Server = function (_EventEmitter) {
    _inherits(Server, _EventEmitter);

    function Server(hostServer) {
        _classCallCheck(this, Server);

        var _this = _possibleConstructorReturn(this, (Server.__proto__ || Object.getPrototypeOf(Server)).call(this));

        _this._hostServer = hostServer;
        assert.ok(hostServer);
        return _this;
    }

    _createClass(Server, [{
        key: 'notifyHostsState',
        value: function notifyHostsState(client, msg) {
            throw new Error('未实现函数notifyHostsState');
        }
    }, {
        key: 'notifyHostStateChanged',
        value: function notifyHostStateChanged(msg) {
            throw new Error('未实现函数notifyHostStateChanged');
        }
    }, {
        key: '_onReceiveMsgIntrusionAlert',
        value: function _onReceiveMsgIntrusionAlert(hid) {
            this._hostServer.clearAlarm(hid);
        }
    }, {
        key: 'start',
        value: function start() {
            throw new Error('未实现函数start');
        }
    }, {
        key: 'stop',
        value: function stop() {
            throw new Error('未实现函数stop');
        }
    }], [{
        key: 'Events',
        get: function get() {
            return _Events;
        }
    }]);

    return Server;
}(EventEmitter);

exports = module.exports = Server;
//# sourceMappingURL=messenger_server.js.map