'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

//数据格式[{id,port},{...},...]
var getHosts = function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        _context.next = 2;
                        return HostService.findAll();

                    case 2:
                        return _context.abrupt('return', _context.sent);

                    case 3:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this);
    }));

    return function getHosts() {
        return _ref.apply(this, arguments);
    };
}();

//数据格式[{id,demo,alarm,screenshot,audio,min,max,presets:[{x,y,z,distance},{...},...]},{...},...]
//id,demo,alarm,screenshot,audio,min,max从MonitoringAreaSchema筛选后通过transformIPC转换
//presets为PresetSchema数据
//查询结果为监控distance位置摄像头的配置信息


var getMointors = function () {
    var _ref2 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee2(hostID, distance) {
        var monitorArea, cams, monitors;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        //MonitoringAreaSchema条件 hostid==host && min<=distance&&distance<=max
                        monitorArea = {};
                        _context2.next = 3;
                        return CamerasService.findAll({ id: 1 });

                    case 3:
                        cams = _context2.sent;
                        _context2.next = 6;
                        return MonitoringService.find_monitoringArea({ hostId: hostID, min_dis: { $lte: distance }, max_dis: { $gte: distance } });

                    case 6:
                        monitors = _context2.sent;
                        //获得监控区域
                        // let monitorList = [];
                        // monitors.forEach(function (monitor) {
                        //     monitorList.push(monitor._doc);
                        // });
                        monitorArea.id = hostID;
                        monitorArea.monitors = [];

                        monitors.forEach(function (monitor) {
                            //const camera = await CamerasService.find_one(monitor.cameraId);//获得关联摄像头
                            //const presets = await PresetService.find_preset({monitorId:monitor.id});
                            var camera = {};
                            if (cams && cams.length > 0) {
                                cams.forEach(function (item, index, arr) {
                                    if (monitor.cameraId === item.id) {
                                        camera = item;
                                    }
                                });
                            }
                            var m = { id: camera.id, demo: camera.ptz, alarm: camera.alarm, audio: camera.audio, screenShot: camera.screenShot, min: monitor.min_dis, max: monitor.max_dis, presets: camera.preset };
                            //m.presets = presets;
                            //monitorArea.monitors = m;
                            monitorArea.monitors.push(m);
                        });
                        return _context2.abrupt('return', monitorArea.monitors);

                    case 11:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, this);
    }));

    return function getMointors(_x, _x2) {
        return _ref2.apply(this, arguments);
    };
}();

//数据格式transformIPC
var getIPC = function () {
    var _ref3 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee3(id) {
        var ipc, vendor;
        return _regenerator2.default.wrap(function _callee3$(_context3) {
            while (1) {
                switch (_context3.prev = _context3.next) {
                    case 0:
                        _context3.next = 2;
                        return CamerasService.find_one(id);

                    case 2:
                        ipc = _context3.sent;

                        if (ipc) {
                            _context3.next = 6;
                            break;
                        }

                        _context3.next = 6;
                        return Promise.reject();

                    case 6:
                        _context3.next = 8;
                        return VendorService.find_one(ipc.brand);

                    case 8:
                        vendor = _context3.sent;

                        if (vendor) {
                            ipc.brand = vendor.vendorCode;
                            logger.log('摄像头厂商', vendor.vendorCode);
                            console.log('摄像头厂商' + vendor.vendorCode);
                        }
                        return _context3.abrupt('return', transformIPC(ipc));

                    case 11:
                    case 'end':
                        return _context3.stop();
                }
            }
        }, _callee3, this);
    }));

    return function getIPC(_x3) {
        return _ref3.apply(this, arguments);
    };
}();

var getAllIPC = function () {
    var _ref4 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee4() {
        var ipcs, ipcList;
        return _regenerator2.default.wrap(function _callee4$(_context4) {
            while (1) {
                switch (_context4.prev = _context4.next) {
                    case 0:
                        _context4.next = 2;
                        return CamerasService.findAll({ id: 1 });

                    case 2:
                        ipcs = _context4.sent;
                        ipcList = [];

                        ipcs.forEach(function (ipc) {
                            ipcList.push(ipc._doc);
                        });
                        return _context4.abrupt('return', ipcList);

                    case 6:
                    case 'end':
                        return _context4.stop();
                }
            }
        }, _callee4, this);
    }));

    return function getAllIPC() {
        return _ref4.apply(this, arguments);
    };
}();

/*
//数据格式[1,2,3,4,5]
async function getIPCIDsSortByPoint(){
    //查询出所有摄像头的编号返回即可，根据摄像头的编号排序基本没问题
    let ipcs= await CamerasService.findAll({id:1});
    let ipcIds=[];
    ipcs.forEach(function (ipc) {
        ipcIds.push(ipc._doc.id);
    });
    return ipcIds;
}
*/

//记录警报


var recordAlert = function () {
    var _ref5 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee5(record) {
        var event;
        return _regenerator2.default.wrap(function _callee5$(_context5) {
            while (1) {
                switch (_context5.prev = _context5.next) {
                    case 0:
                        //属性id，hid(主机id),position(报警位置)
                        //*******将报警事件添加到数据库*******//
                        event = {};

                        event.id = record.id;
                        event.happenTime = moment().format('YYYY年MM月DD日 HH:mm:ss');
                        event.position = record.position;
                        event.hid = record.hid;

                        _context5.next = 7;
                        return EventService.add_event(event);

                    case 7:
                    case 'end':
                        return _context5.stop();
                }
            }
        }, _callee5, this);
    }));

    return function recordAlert(_x4) {
        return _ref5.apply(this, arguments);
    };
}();

//用于事件调用摄像头记录下的路线


var recordAlertVideo = function () {
    var _ref6 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee6(record) {
        var eventVideo;
        return _regenerator2.default.wrap(function _callee6$(_context6) {
            while (1) {
                switch (_context6.prev = _context6.next) {
                    case 0:
                        //属性id(同recordalert中的id，为事件编号)，path,pid(摄像头id),hid(主机id)
                        //*******将录制视频的摄像头以及录像地址存入数据库*******//
                        eventVideo = {};

                        eventVideo.eventId = record.id;
                        eventVideo.pid = record.pid;
                        eventVideo.path = data.path;

                        _context6.next = 6;
                        return EventVideoService.add_eventVideo(event);

                    case 6:
                    case 'end':
                        return _context6.stop();
                }
            }
        }, _callee6, this);
    }));

    return function recordAlertVideo(_x5) {
        return _ref6.apply(this, arguments);
    };
}();

var eventRecord = function () {
    var _ref7 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee7() {
        var alert;
        return _regenerator2.default.wrap(function _callee7$(_context7) {
            while (1) {
                switch (_context7.prev = _context7.next) {
                    case 0:
                        _context7.next = 2;
                        return recordAlert();

                    case 2:
                        alert = _context7.sent;

                    case 3:
                    case 'end':
                        return _context7.stop();
                }
            }
        }, _callee7, this);
    }));

    return function eventRecord() {
        return _ref7.apply(this, arguments);
    };
}();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

/**
 * Created by Luky on 2017/8/17.
 */

//import HostService from '../services/hostService';
//import MonitoringService from '../services/monitoringService';
//import PresetService from '../services/PresetService';
//import CameraService from '../services/cameraService';

var HostService = require('../services/hostService');
var MonitoringService = require('../services/monitoringService');
//const PresetService =require('../services/PresetService');
var CamerasService = require('../services/camerasService');
var VendorService = require('../services/vendorService');
var EventService = require('../services/eventService');
var EventVideoService = require('../services/eventVideoService');
var moment = require('moment');

var _ = require('lodash');
var config = global.server_config || require('../config/config');
var fileServer = require('./data_server_file');

var _require = require('../log/log'),
    Parser = _require.Parser;

var logger = {};
Parser(logger, 'data_server.js');

var setBrands = {
    '大华': 'dahua', 'dahua': 'dahua',
    '和普威尔': 'hopewell', 'hopewell': 'hopewell',
    '海康威视': 'hikvision', 'hikvision': 'hikvision',
    '国营508集成海康威视': '508', '508': '508',
    'onvif协议': 'onvif', 'onvif': 'onvif'
};

function transformIPC(ipc) {

    return {
        id: ipc.id,
        ip: ipc.ip,
        port: ipc.port,
        user: ipc.user,
        pwd: ipc.pwd,
        brand: setBrands[ipc.brand],
        ptz: {
            port: ipc.serial_port
        },
        functions: {
            ptz: ipc.ptz,
            alarm: ipc.alarm,
            audio: ipc.audio
        },
        onvif: {
            user: ipc.onvif_user,
            pwd: ipc.onvif_pwd,
            port: ipc.onvif_port,
            path: ipc.onvif_path
        }
    };
}

var exp = {
    getHosts: getHosts,
    getMointors: getMointors,
    getIPC: getIPC,
    getAllIPC: getAllIPC,
    //getIPCIDsSortByPoint,
    transformIPC: transformIPC,
    recordAlert: recordAlert,
    recordAlertVideo: recordAlertVideo
};

function proxy(name) {
    var store = _.get(config, 'runMode.store', 'db');
    logger.log('调用数据服务', { store: store, name: name });
    var fun = (store === 'db' ? exp : fileServer)[name];
    return fun.apply(null, Array.prototype.slice.call(arguments, 1));
}

exports = module.exports = {
    getMointors: _.partial(proxy, 'getMointors'),
    getHosts: _.partial(proxy, 'getHosts'),
    getIPC: _.partial(proxy, 'getIPC'),
    getAllIPC: _.partial(proxy, 'getAllIPC'),
    //getIPCIDsSortByPoint:_.partial(proxy,'getIPCIDsSortByPoint'),
    transformIPC: _.partial(proxy, 'transformIPC'),
    recordAlert: _.partial(proxy, 'recordAlert'),
    recordAlertVideo: _.partial(proxy, 'recordAlertVideo')
};
//# sourceMappingURL=data_server.js.map