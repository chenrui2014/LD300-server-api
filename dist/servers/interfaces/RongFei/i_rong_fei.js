'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Created by Luky on 2017/10/21.
 */

var _ = require('lodash');
var config = global.server_config || require('../../../config/config');
var Formatter = require('../cmd_formatter');
var Host = require('../../../host/host');
var partition = config.getData('partition_host_config.json');

var RFCmdFormatter = function (_Formatter) {
    _inherits(RFCmdFormatter, _Formatter);

    function RFCmdFormatter() {
        _classCallCheck(this, RFCmdFormatter);

        return _possibleConstructorReturn(this, (RFCmdFormatter.__proto__ || Object.getPrototypeOf(RFCmdFormatter)).apply(this, arguments));
    }

    _createClass(RFCmdFormatter, [{
        key: 'formatHostStateChanged',
        value: function formatHostStateChanged(index, hostEvt) {
            /*    [
                    {name:'length',size:8,val:8},
                    {name:'index',size:12,val:(index&0xfff)},
                    {name:'hostID',size:8,val:(hid&0xff)},
                    {name:'type',size:4,val:(type&0xf)},
                    {name:'extParam',size:32,val:(type&0xffff)}
                ]);*/
            var type = 0;var ext = 0;
            if (hostEvt.stateNew === Host.States.Alarm) {
                type = 1;
                ext = this.getPartition(hostEvt.hid, hostEvt.position);
                if (-1 === ext) {
                    return null;
                }
            } else if (hostEvt.stateNew === Host.States.Error) {
                type = 3; //主机异常
            } else if (hostEvt.stateNew === Host.States.Unknown) {
                type = 4; //主机失联
            }
            var ret = Buffer.allocUnsafe(8);
            var i = 0;
            ret.writeUInt32BE(0x08000000 | (index & 0xfff) << 12 | (hostEvt.hid & 0xff) << 4 | type & 0xf, i, true);i += 4;
            ret.writeUInt32BE(ext, i, true);
            return ret;
        }
    }, {
        key: 'formatReceived',
        value: function formatReceived(cmd) {
            if (cmd.length !== 8) return { type: Formatter.CmdReceived.unKnown };
            var data1 = cmd.readUInt32BE(0, true);
            var hid = 0x00000fff & data1;
            var cmdType = hid & 0xf;
            hid = hid >> 4;
            if (cmdType === 0) {
                return { type: Formatter.CmdReceived.clear, hid: hid };
            }
            return { type: Formatter.CmdReceived.unKnown };
        }
    }, {
        key: 'getPartition',
        value: function getPartition(hostid, position) {
            if (hostid >= partition.length) {
                return -1;
            }
            var pi = partition[hostid].partition;
            var ret = _.find(pi, function (dis) {
                return dis.distance >= position;
            }) || { index: -1 };
            return ret.index;
        }
    }]);

    return RFCmdFormatter;
}(Formatter);

exports = module.exports = RFCmdFormatter;
//# sourceMappingURL=i_rong_fei.js.map