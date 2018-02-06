'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Created by Luky on 2017/7/20.
 */

var EventEmitter = require('events').EventEmitter;
var io = require('socket.io');
var assert = require('assert');
var _ = require('lodash');
var path = require('path');
var crypto = require('crypto');
var factory = require('./ipc_factory');
var url = require('url');
var Writable = require('stream').Writable;
var config = global.server_config || require('../config/config');
var ptzLock = _.get(config, 'ipc.ptzLock', 15000);

var Live = function (_EventEmitter) {
    _inherits(Live, _EventEmitter);

    function Live(port, _path) {
        _classCallCheck(this, Live);

        var _this = _possibleConstructorReturn(this, (Live.__proto__ || Object.getPrototypeOf(Live)).call(this));

        _this._port = port || _.get(config, 'ipc_server.port', 3000);
        _this._path = _path || _.get(config, 'ipc_server.path', '/live');
        _this._open();
        _this._rooms = {};
        return _this;
    }

    _createClass(Live, [{
        key: '_open',
        value: function _open() {
            var _this2 = this;

            if (this._server) return;
            var socket = this._server = io({
                path: this._path,
                serveClient: false
            });
            //socket.origins(['*']);
            socket.listen(this._port);
            socket.on('connection', function (client) {
                var uri = url.parse(client.request.url, true);
                var user = client.id;
                var roomIDRegExp = new RegExp(_this2.path.path + '\\/(\\d+)', 'i');
                var id = _.last(roomIDRegExp.exec(uri.path) || [-1]) - 0;
                var freePTZ = function freePTZ(zoom) {
                    delete zoom.freePTZ;
                    delete zoom.ptz;
                };
                var play = function play(id, preset, persistence) {
                    var ipc = factory.getIPC(id);
                    if (!ipc) {
                        client.emit('play', { type: 'error', msg: '请求的摄像头不存在' });
                        return;
                    }
                    if (id in _this2._rooms) {
                        client.join(id);
                        _this2._rooms[id].client++;
                        client.emit('play', { type: 'succeed', msg: '成功加入监控' });
                        return;
                    }
                    ipc.play(preset).then(function () {
                        client.join(id);
                        _this2._rooms[id] = { client: 1, ipc: ipc };
                        ipc.on('data', function (data) {
                            socket.to(id).emit('stream', data /*,{for:'everyone'}*/);
                        });
                        if (persistence) {
                            ipc.pipe(_this2, { end: false });
                        }
                        client.emit('play', { type: 'succeed', msg: '成功加入监控' });
                    }).catch(function (err) {
                        client.emit('play', { type: 'error', msg: '\u8BF7\u6C42\u7684\u6444\u50CF\u5934\u5DE5\u4F5C\u5F02\u5E38,\u5185\u90E8\u9519\u8BEF\u4FE1\u606F\u4E3A' + err });
                    });
                };
                if (id !== -1) {
                    play(id, uri.search.preset, uri.search.persistence);
                }
                client.on('play', play);
                client.on('ptz', function (id, method, args) {
                    assert.ok(user in client.rooms);
                    assert.ok(_this2._rooms[id].client > 0);
                    var zoom = _this2._rooms[id];
                    if (zoom[id].ptz && zoom.ptz !== user) {
                        client.emit('ptz', { type: 'locked', msg: '\u4E91\u53F0\u6B63\u5728\u88AB\u4F7F\u7528\u4E2D,\u5185\u90E8\u7801' + zoom.ptz });
                        return;
                    }
                    zoom.ptz = user;
                    zoom.freePTZ = zoom.freePTZ || freePTZ.bind(null, zoom);
                    _.throttle(zoom.freePTZ, ptzLock);
                    assert.ok(['zoomIn', 'zoomOut', 'focusIn', 'focusOut', 'apertureIn', 'apertureOut', 'move', 'moveToPoint', 'ptzStop'].indexOf(method) !== -1);
                    zoom.ipc[method].apply(zoom.ipc, args);
                });
                client.on('disconnect', function (reason) {});
                client.on('leave', function (id) {
                    client.emit('leave', { type: 'succeed', msg: '成功退出监控' });
                    assert.ok(id in _this2._rooms);
                    _this2._rooms[id].client--;
                    if (0 === _this2._rooms[id].client) {
                        var ipc = factory.getIPC(id);
                        ipc.unpipe(_this2);
                        ipc.stopPlay().then(function () {}).catch(function () {});
                    }
                    client.leave(id);
                });
            });
        }
    }, {
        key: '_close',
        value: function _close() {
            if (this._server) {
                this._server.removeAllListeners();
                this._server.close();
                this._server = null;
            }
        }
    }, {
        key: 'path',
        get: function get() {
            return { port: this._port, path: this._path };
        }
    }]);

    return Live;
}(EventEmitter);
/*

function randomPath(){
    const hash = crypto.createHash('md5');
    hash.update(new Date().getTime().toString());
    return hash.digest('hex').slice(0,8);
}
*/

exports = module.exports = new Live();
//# sourceMappingURL=__live_server.js.map