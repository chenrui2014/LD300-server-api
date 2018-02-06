'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Created by Luky on 2017/9/21.
 */
var Data = require('./data_server');
var _ = require('lodash');

var IPCMointor = function () {
    function IPCMointor(hid) {
        _classCallCheck(this, IPCMointor);

        this._hid = hid;
    }

    _createClass(IPCMointor, [{
        key: 'getMointors',

        //{100:{range,points,demo,id},...}
        /*   _setMointor(mointors){
               this._mointors={};
               let ms=_.groupBy(mointors,'id');
               _.each(ms,(ipc,id)=>{
                   let sorted=_.orderBy(ipc,'distance');
                   this._mointors[id]={
                       range:[_.first(sorted).distance,_.last(sorted).distance],
                       points:sorted,
                       demo:sorted[0].demo,
                       id:id-0
                   };
               });
           }*/

        //一个摄像头位置一个对象，其中range在球机中代表一个点，在枪机中代表一个一段距离的开始点
        value: function () {
            var _ref = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee(distance) {
                var ipcs, ret;
                return _regenerator2.default.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                _context.next = 2;
                                return Data.getMointors(this._hid, distance);

                            case 2:
                                ipcs = _context.sent;
                                ret = [];

                                _.each(ipcs, function (ipc) {
                                    var isDemo = !!ipc.demo;
                                    if (isDemo) {
                                        var index = _.findIndex(_.sortBy(ipc.presets, 'distance'), function (rangei) {
                                            return rangei.distance >= distance;
                                        });
                                        if (-1 === index) {
                                            ret.push({
                                                id: ipc.id,
                                                alarm: ipc.alarm,
                                                talk: ipc.audio,
                                                screenshot: ipc.screenshot,
                                                preset: null, x: -1, y: -1, z: -1,
                                                demo: true
                                            });
                                        } else {
                                            var cams = [null, ipc.presets[index] /*,null*/];
                                            if (index > 0) cams[0] = ipc.presets[index - 1];
                                            //if(index+1<mi.range.length)cams[2]=mi.range[index+1];
                                            ret.push(_.extend({
                                                id: ipc.id,
                                                alarm: ipc.alarm,
                                                talk: ipc.audio,
                                                screenshot: ipc.screenshot,
                                                demo: true }, calcXYZ(cams, distance)));
                                        }
                                    } else {
                                        ret.push({
                                            id: ipc.id,
                                            alarm: ipc.alarm,
                                            talk: ipc.audio,
                                            screenshot: ipc.screenshot,
                                            preset: null, x: 0, y: 0, z: 0,
                                            demo: false
                                        });
                                    }
                                });
                                return _context.abrupt('return', ret);

                            case 6:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));

            function getMointors(_x) {
                return _ref.apply(this, arguments);
            }

            return getMointors;
        }()
    }, {
        key: 'hostID',
        get: function get() {
            return this._hid;
        },
        set: function set(val) {
            this._hid = val;
        }
    }]);

    return IPCMointor;
}();

//插值计算偏移


function interpolate(distance1, xx1, point2, xx2, distance) {
    return Math.floor(xx1 + (xx2 - xx1) * (distance - distance1) / (point2 - distance1));
}

function calcXYZ(cams, distance) {
    //距离小于1米也不需要处理
    var x1 = cams[1].x;
    var y1 = cams[1].y;
    var z1 = cams[1].z;
    if ( /*null===cams[2]&&*/null === cams[0] || Math.abs(cams[1].distance - distance) <= 1) {
        return {
            x: x1,
            y: y1,
            z: z1,
            preset: null //cams[1].preset.preset,暂时不设置预置点，简单点
        };
    }
    /*    let distance1=-1,distance2=-1;
        if(cams[0]){
            distance1=position-cams[0].range[0];
        }
        if(cams[2]){
            distance2=cams[2].range[0]-position;
        }*/
    var other = cams[0];
    /*    if(distance1===-1||(distance2!==-1&&distance2<=distance1)){
            other=cams[2];
        }*/
    return {
        x: interpolate(other.distance, other.x, cams[1].distance, x1, distance),
        y: interpolate(other.distance, other.y, cams[1].distance, y1, distance),
        z: interpolate(other.distance, other.z, cams[1].distance, z1, distance),
        preset: null
    };
}

exports = module.exports = IPCMointor;
//# sourceMappingURL=ipc_mointors.js.map