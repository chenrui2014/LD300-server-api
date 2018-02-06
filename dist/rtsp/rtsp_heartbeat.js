'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Created by Luky on 2017/7/17.
 */
var EventEmitter = require('events').EventEmitter;
var net = require("net");
var url = require('url');
var WWW_AUTH_REGEX = new RegExp('[\s,]([a-z]+)=([^,\s]+)');

var _require = require("crypto"),
    createHash = _require.createHash;

var _ = require('lodash');

var HeartBeat = function (_EventEmitter) {
    _inherits(HeartBeat, _EventEmitter);

    function HeartBeat(uri, user, pwd) {
        _classCallCheck(this, HeartBeat);

        var _this = _possibleConstructorReturn(this, (HeartBeat.__proto__ || Object.getPrototypeOf(HeartBeat)).call(this));

        _this.uri = uri;
        _this.user = user;
        _this.pwd = pwd;
        _this.isConnected = false;
        _this._cSeq = 0;
        _this.headers = { 'User-Agent': 'lambda/1.0.0' };
        return _this;
    }

    _createClass(HeartBeat, [{
        key: 'sendRequest',
        value: function sendRequest(requestName, headers) {
            headers = headers || {};
            var id = ++this._cSeq;
            // mutable via string addition
            var req = requestName + ' ' + this.uri + ' RTSP/1.0\r\nCSeq: ' + id + '\r\n';

            Object.assign(headers, this.headers);

            Object.keys(headers).forEach(function (header) {
                req += header + ': ' + headers[header].toString() + '\r\n';
            });

            this.client.write(req + '\r\n');
        }
    }, {
        key: 'sendOPTIONS',
        value: function sendOPTIONS() {
            this.sendRequest('OPTIONS');
        }
    }, {
        key: 'sendAuth',
        value: function sendAuth(headers) {
            var auth = headers["WWW-Authenticate"];
            var type = auth.split(" ")[0];
            var authHeaders = {};
            _.each(auth.slice(type.length + 1).split(','), function (prot) {
                var index = prot.indexOf('=');
                authHeaders[_.trim(prot.slice(0, index), '\'"')] = _.trim(prot.slice(index + 1), '\'"');
            });

            // mutable, but only assigned to by if block
            var authString = "";
            if (type === "Digest") {
                // Digest Authentication
                var ha1 = getMD5Hash(this.user + ':' + authHeaders.realm + ':' + this.pwd);
                var ha2 = getMD5Hash('OPTIONS' + ':' + this.uri);
                var ha3 = getMD5Hash(ha1 + ':' + authHeaders.nonce + ':' + ha2);

                authString = 'Digest username="' + this.user + '",realm="' + authHeaders.realm + '",nonce="' + authHeaders.nonce + '",uri="' + this.uri + '",response="' + ha3 + '"';
            } else if (type === "Basic") {
                // Basic Authentication
                // https://xkcd.com/538/
                authString = 'Basic ' + new Buffer(this.user + ':' + this.pwd).toString('base64');
            }
            this.sendRequest('OPTIONS', Object.assign(headers, { Authorization: authString }));
        }
    }, {
        key: '_onData',
        value: function _onData(data) {
            var _responseToObject = responseToObject(data.toString('utf8')),
                _responseToObject2 = _slicedToArray(_responseToObject, 3),
                statusCode = _responseToObject2[0],
                CSeq = _responseToObject2[1],
                r = _responseToObject2[2];

            if (statusCode === 401) {
                //未授权
                return this.sendAuth(r);
            }
            this.emit('Alive');
            if (this._continue) setTimeout(this.sendOPTIONS.bind(this), 1500);
        }
    }, {
        key: '_onError',
        value: function _onError(e) {
            var _this2 = this;

            this.emit('Offline', e);
            this.stopListen();
            setTimeout(function () {
                _this2.listen();
            }, 2000);
        }
    }, {
        key: 'listen',
        value: function listen() {
            var _this3 = this;

            var _url$parse = url.parse(this.uri),
                hostname = _url$parse.hostname,
                port = _url$parse.port;

            var client = net.connect(port || 554, hostname, function () {
                _this3.isConnected = true;
                _this3.client = client;
                _this3.sendOPTIONS();
            });
            client.on("data", this._onData.bind(this));
            client.on("error", this._onError.bind(this));
            //client.on("close", this._onClose.bind(this));
            this._continue = true;
        }
    }, {
        key: 'stopListen',
        value: function stopListen() {
            this._continue = false;
            this.client.removeAllListeners();
            this.client.close();
            delete this.client;
        }
    }]);

    return HeartBeat;
}(EventEmitter);

function getMD5Hash(str) {
    var md5 = createHash("md5");
    md5.update(str);
    return md5.digest("hex");
}

function responseToObject(str) {
    var statusCode = parseInt(str.split(' ')[1]);
    var lines = str.split('\r');
    var CSeq = -1;
    var ret = {};
    for (var i = 1; i < lines.length; i++) {
        var linei = lines[i];
        var m = linei.indexOf(':');
        if (-1 === m) break;
        var key = linei.slice(0, m).trim(),
            val = linei.slice(m + 1).trim();
        if (key.toLowerCase() === 'cseq') {
            CSeq = val;
            continue;
        }
        ret[key] = val;
    }
    return [statusCode, CSeq, ret];
}

exports = module.exports = HeartBeat;
//# sourceMappingURL=rtsp_heartbeat.js.map