'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Created by Luky on 2017/9/4.
 */
var config = global.server_config || require('../config/config');
var root = config.root;
var _ = require('lodash');
var mkdirp = require('mkdirp');
var path = require('path');
var stringFormat = require('string-template');

var Persistence = function () {
    function Persistence(options) {
        _classCallCheck(this, Persistence);

        this.options = {
            pathTempl: '../assets/monitors/{yyyy}{mm}',
            imageTempl: '{dd}-{hh}{mi}{ss}-{iter}-{prefix}',
            videoTempl: '{dd}-{hh}{mi}{ss}-{prefix}'
        };
        _.extend(this.options, _.get(config, 'persistence', null), options);
        this._index = 0;
    }

    _createClass(Persistence, [{
        key: '_unTemplate',
        value: function _unTemplate(template, prefix) {
            var date = new Date();
            if (template.indexOf('{iter}') > -1) {
                this._index++;
            }
            return stringFormat(template, {
                'prefix': prefix,
                'yy': date.getFullYear() % 100,
                'yyyy': date.getFullYear(),
                'mm': _.padStart('' + (date.getMonth() + 1), 2, 0),
                'dd': _.padStart('' + date.getDate(), 2, 0),
                'hh': _.padStart('' + date.getHours(), 2, 0),
                'mi': _.padStart('' + date.getMinutes(), 2, 0),
                'ss': _.padStart('' + date.getSeconds(), 2, 0),
                'iter': _.padStart('' + this._index, 3, 0)
            });
        }
    }, {
        key: 'imagePath',
        value: function imagePath() {
            var prefix = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
            var postfix = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'jpg';

            return path.resolve(this._path, this._unTemplate(this.options.imageTempl, prefix)) + '.' + postfix;
        }
    }, {
        key: 'videoPath',
        value: function videoPath() {
            var prefix = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
            var postfix = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'flv';

            return path.resolve(this._path, this._unTemplate(this.options.videoTempl, prefix)) + '.' + postfix;
        }
    }, {
        key: '_path',
        get: function get() {
            if (this.__path) {
                return this.__path;
            }
            var ret = path.resolve(root, this._unTemplate(this.options.pathTempl));
            mkdirp.sync(ret);
            return this.__path = ret;
        }
    }]);

    return Persistence;
}();

exports = module.exports = Persistence;
//# sourceMappingURL=ipc_video_persistence.js.map