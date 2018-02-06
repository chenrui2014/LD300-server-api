'use strict';

var config = require('../config/config');
config.runMode.type = 'BS';
config.runMode.store = 'file';
var hostData = require('../data/hosts_config.json');
var mData = require('../data/mointors_config.json');
var ipcData = require('../data/ipcs_config.json');
var _ = require('lodash');

function setHostData(data) {
    hostData.length = 0;
    _.each(data, function (item) {
        hostData.push(item);
    });
}

function setMData(data) {
    mData.length = 0;
    _.each(data, function (item) {
        mData.push(item);
    });
}

function setIpcData(data) {
    ipcData.length = 0;
    _.each(data, function (item) {
        ipcData.push(item);
    });
}

setMData([{
    id: 1,
    mointors: [{
        id: 1, //98_dahua_demo
        alarm: false,
        screenshot: false,
        audio: false,
        demo: false,
        presets: [],
        min: 80,
        max: 90
    }, {
        id: 5, //106_dahua_demo
        alarm: true,
        screenshot: true,
        audio: true,
        demo: true, //是否球机
        presets: [{ "x": 1, "y": 1, "z": 1, preset: '1', distance: 700 }, //球机预置点信息
        { "x": 16, "y": 1, "z": 1, preset: '1', distance: 800 }, { "x": 10, "y": 1, "z": 1, preset: '2', distance: 900 }],
        min: 700, //距离
        max: 900
    }]
}]);

exports = module.exports = {
    setHostData: setHostData,
    setMData: setMData,
    setIpcData: setIpcData
};
//# sourceMappingURL=modify_config.js.map