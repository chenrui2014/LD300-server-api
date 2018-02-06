'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

/**
 * Created by Luky on 2017/10/22.
 */
var config = global.server_config || require('../config/config');
var systemConfig = config.getData('system_config.json');
var userConfig = config.getData('user_config.json');
var _ = require('lodash');
var path = require('path');
var fs = require('fs');
var assert = require('assert');

function _upgradeHostData() {
    var data = [];
    _.each(_.get(systemConfig, 'serialport', []), function (port, index) {
        data.push({ id: index, port: '\\\\.\\COM' + port });
    });
    return data;
}

function _upgradeCameraAndMointorData() {
    var cames = []; //[{id,user,functons...}]
    var mointors = []; //[{hostid,mointors}]
    var lines = userConfig['lines'] || [];
    var getCame = function getCame(came) {
        return _.find(cames, function (c) {
            return c.ip === came.ip;
        });
    };
    var addCame = function addCame(came) {
        var c = getCame(came);
        if (c) {
            c.functions.alarm = c.functions.alarm || came.alarm;
            c.functions.ptz = c.functions.ptz || came['isDome'];
            c.functions.audio = c.functions.audio || came.talk;
            return c;
        }
        var data = {
            id: cames.length,
            ip: came.ip,
            port: came.port,
            user: came.user,
            pwd: came.pwd,
            brand: came.cid === 0 ? 'dahua' : 'hopewell',
            functions: {
                ptz: came['isDome'] || false,
                alarm: came.alarm || false,
                audio: came.talk || false
            }
        };
        if (data.brand !== 'dahua') {
            data.onvif = {
                port: 80,
                user: 'admin',
                pwd: 'admin',
                path: ''
            };
        }
        cames.push(data);
        return data;
    };
    var addMointor = function addMointor(mointor, c, distance, came) {
        var d = {
            id: c.id,
            demo: c.functions.ptz,
            alarm: came.alarm || false,
            screenshot: came.screenshot || false,
            audio: came.talk || false,
            distance: distance
        };
        if (d.demo) {
            d.preset = { x: came.x || 0, y: came.y || 0, z: came.z || 0, preset: '' };
        }
        mointor.push(d);
    };
    _.each(lines, function (line, index) {
        var cz = line['alarm_channel'];
        if (cz !== -1) {
            mointors.push({ id: index, mointors: _.cloneDeep(mointors[cz].mointors) });
            return;
        }
        var points = line['cam_points'] || [];
        var mointor = [];
        mointors.push({ id: index, mointors: mointor });
        _.each(points, function (point) {
            var came = point['primary'];
            var distance = point['distance'];
            if (came.ip) addMointor(mointor, addCame(came), distance, came);
            came = point['secondary'];
            if (came.ip) addMointor(mointor, addCame(came), distance, came);
        });
    });
    return [cames, mointors];
}

/*先用两点间距离公式求出各边长，角A对应的边长为a，角B对应的边长为b，角C对应的边长为c。
再由余弦公式求得：
cosA=(b*b+c*c-a*a)/2bc
同理可求出cosB，cosC
再用计算器算出arccosA，arccosB和arccosC即得*/

function angle(pointCalc, point1, point2) {
    var aa = (point1.x - point2.x) * (point1.x - point2.x) + (point1.y - point2.y) * (point1.y - point2.y);
    var bb = (point1.x - pointCalc.x) * (point1.x - pointCalc.x) + (point1.y - pointCalc.y) * +(point1.y - pointCalc.y);
    var cc = (point2.x - pointCalc.x) * (point2.x - pointCalc.x) + (point2.y - pointCalc.y) * +(point2.y - pointCalc.y);
    var cosA = (bb + cc - aa) / (2 * Math.sqrt(bb * cc));
    return Math.acos(cosA) * 180 / Math.PI;
}

//计算折返点
function Zf(index) {
    var lines = userConfig['lines'] || [];
    var line = lines[index];
    var points = line['cali_points'];
    points = _.sortBy(points, 'distance');
    if (!points.length) return [];
    var pointA = { x: points[0].point[0], y: points[0].point[1] };
    var ret = [];
    for (var i = 1; i < points.length - 1; i++) {
        var pointB = { x: points[i].point[0], y: points[i].point[1] };
        var pointC = { x: points[i + 1].point[0], y: points[i + 1].point[1] };
        var a = angle(pointB, pointA, pointC);
        if (a < 10) ret.push(points[i]['distance']);
        pointA = pointB;
    }
    return ret;
}

function upgradeMointorData2(mointors) {
    var ret = [];
    _.each(mointors, function (mo, index) {
        var ms = _.cloneDeep(mo.mointors);
        var zf = (Zf(index) || [99999999]).concat([9999999]);
        var ms2 = [];
        var fromIndex = [0];
        //console.log(`zfd${JSON.stringify(zf)}`);
        var findIPC = function findIPC(ipc, z) {
            return _.find(ms2, function (i) {
                return i.id === ipc.id;
            }, fromIndex[z]);
        };
        ms = _.sortBy(ms, 'distance');
        var z = 0;
        _.each(ms, function (i) {

            if (i.distance > zf[z]) {
                //ipcs.length-1时拐点处的摄像头连续
                fromIndex.push(ms2.length - 1);z++;
            }
            var ipc = findIPC(i, z);
            if (!ipc) {
                var i2 = _.cloneDeep(i);
                delete i2.distance;
                delete i2.preset;
                i2.max = i2.min = i.distance;
                i2.presets = [];
                if (i.demo) {
                    var preset = _.cloneDeep(i.preset);
                    preset.distance = i.distance;
                    i2.presets.push();
                }
                ms2.push(i2);
            } else {
                ipc.min = Math.min(ipc.min, i.distance);
                ipc.max = Math.max(ipc.max, i.distance);
                if (i.demo) {
                    var _preset = _.cloneDeep(i.preset);
                    _preset.distance = i.distance;
                    ipc.presets.push(_preset);
                }
            }
        });
        ret.push({ id: mo.id, mointors: ms2 });
    });
    return ret;
}

function _partition(mointors, ipcData) {
    var r = [];
    var getData = function getData(id) {
        return _.find(ipcData, function (data) {
            return data.id === id;
        });
    };
    _.each(mointors, function (m, xh) {
        if (!m.mointors.length) return;
        var ipcs = [];
        var partition = [];
        var zf = (Zf(xh) || [99999999]).concat([9999999]);
        var fromIndex = [0];
        //console.log(`zfd${JSON.stringify(zf)}`);
        var findIPC = function findIPC(ipc, z) {
            return _.find(ipcs, function (i) {
                return i.id === ipc.id;
            }, fromIndex[z]);
        };
        var index = 1;
        m.mointors = _.sortBy(m.mointors, 'point');
        var z = 0;
        _.each(m.mointors, function (i) {
            if (i.distance > zf[z]) {
                //ipcs.length-1时拐点处的摄像头连续
                fromIndex.push(ipcs.length - 1);z++;
            }
            var ipc = findIPC(i, z);
            if (!ipc) {
                ipcs.push({ id: i.id, min: i.distance, max: i.distance, demo: getData(i.id).functions.ptz });
            } else {
                ipc.min = Math.min(ipc.min, i.distance);
                ipc.max = Math.max(ipc.max, i.distance);
            }
        });
        var ipcsSorted = _.sortBy(ipcs, ['min', 'max']);
        /*        for(let i=0;i<ipcsSorted.length;i++){
                    let ipci=ipcsSorted[i];
                    console.log(`demo:${getData(ipci.id).functions.ptz},id:${ipci.id},[${ipci.min},${ipci.max}]`);
                }*/

        var _$partition = _.partition(ipcsSorted, function (ipc) {
            return ipc.demo;
        }),
            _$partition2 = _slicedToArray(_$partition, 2),
            demo = _$partition2[0],
            undemo = _$partition2[1];
        //两种情况 狗牙式、包含方式、可能存在不叠加不覆盖的情况,也没关系
        //处理枪机


        undemo.push({ id: 9999999, min: 999999, max: 999999 });
        for (var i = 0; i < undemo.length - 1; i++) {
            var ipc1 = undemo[i];
            var ipc2 = undemo[i + 1];
            if (ipc2.min > ipc1.max) {
                partition.push({ ipcs: [ipc1.id], min: ipc1.min, max: ipc1.max });
            } else if (ipc2.min === ipc1.max) {
                partition.push({ ipcs: [ipc1.id], min: ipc1.min, max: ipc1.max });
                ipc2.min++;
            } else if (ipc2.min > ipc1.min) {
                //ipc1有独立的位置
                partition.push({ ipcs: [ipc1.id], min: ipc1.min, max: ipc2.min - 1 });
                ipc1.min = ipc2.min = ipc2.min - 1;
                i--;
            } else {
                //ipc2.min==ipc1.min
                var max = Math.min(ipc1.max, ipc2.max);
                partition.push({ ipcs: [ipc1.id, ipc2.id], min: ipc2.min, max: max });
                if (ipc2.min === ipc2.max) i++;else ipc2.min = ipc1.min = ipc1.max + 1;
            }
        }
        //插入球机
        _.each(demo, function (ipc) {
            for (var _i = 0; _i < partition.length; _i++) {
                var pi = partition[_i];
                if (ipc.max <= pi.min) {
                    break;
                }
                if (ipc.min < pi.max) {
                    if (ipc.max >= pi.max) {
                        pi.ipcs.push(ipc.id);
                    } else {
                        partition.splice(_i, 0, _.cloneDeep(pi));
                        pi.min = ipc.max + 1;
                        partition[_i].max = ipc.max;
                        partition[_i].ipcs.push(ipc.id);
                        break;
                    }
                }
            }
        });

        //分组存储
        r[xh] = _.groupBy(partition, function (item) {
            var ipcs = item.ipcs;
            delete item.ipcs;
            return _.sortBy(ipcs).join(',');
        });

        //打印分区区域距离
        /*        _.each(partition,(p)=>{
                    let result=[];
                    _.each(p.ipcs,(p)=>{
                       result.push(p.id);
                    });
                    console.log(`[${result.join(',')}],[${p.min},${p.max}]`);
                });*/
    });
    //打印摄像头的分组情况
    /*    _.each(r,(ri)=>{
            console.log(_.keys(ri).sort((a,b)=>{
                let ar=a.split(','),br=b.split(',');
                  let i=0,mi=Math.min(ar.length,br.length);
                while(i<mi){
                    if(ar[i]===br[i]){i++;continue;}
                    return ar[i]-br[i];
                }
                return ar.length-br.length;
            }).join('|'));
        });*/
    return r;
}

var wOption = {
    flags: 'w',
    encoding: null,
    fd: null,
    mode: 438,
    autoClose: true
};

function upgrade() {
    var hosts = _upgradeHostData();

    var _upgradeCameraAndMoin = _upgradeCameraAndMointorData(),
        _upgradeCameraAndMoin2 = _slicedToArray(_upgradeCameraAndMoin, 2),
        cames = _upgradeCameraAndMoin2[0],
        mointors = _upgradeCameraAndMoin2[1];

    var hostFile = config.getDataDir('hosts_config.json');
    var camesFile = config.getDataDir('ipcs_config.json');
    var mFile = config.getDataDir('mointors_config.json');
    var fh = fs.createWriteStream(hostFile, wOption);
    fh.write(JSON.stringify(hosts));
    fh.close();
    var fi = fs.createWriteStream(camesFile, wOption);
    fi.write(JSON.stringify(cames));
    fi.close();
    var fm = fs.createWriteStream(mFile, wOption);
    fm.write(JSON.stringify(upgradeMointorData2(mointors)));
    fm.close();

    var p = _partition(mointors, cames);
    var allGroup = [];
    _.each(p, function (pi) {
        allGroup = _.union(allGroup, _.keys(pi));
    });

    allGroup.sort(function (a, b) {
        var ar = a.split(','),
            br = b.split(',');

        var i = 0,
            mi = Math.min(ar.length, br.length);
        while (i < mi) {
            if (ar[i] === br[i]) {
                i++;continue;
            }
            return ar[i] - br[i];
        }
        return ar.length - br.length;
    });

    var getIPC = function getIPC(ipcID) {
        return _.find(cames, function (i) {
            return i.id === ipcID;
        });
    };

    var fq = [];

    var partitionJson = config.getDataDir('partition_ipc_config.json');
    var partitionHostJson = config.getDataDir('partition_host_config.json');
    var partitionTxt = config.getDataDir('partition.txt');
    var fj = fs.createWriteStream(partitionJson, wOption);
    var ft = fs.createWriteStream(partitionTxt, wOption);
    var fhj = fs.createWriteStream(partitionHostJson, wOption);
    fh.write(JSON.stringify(hosts));

    _.each(allGroup, function (group, index) {
        ft.write('\u5206\u533A' + index + '\r\n');
        _.each(group.split(','), function (ipcID) {
            ft.write('\u6444\u50CF\u5934ip' + getIPC(ipcID - 0).ip + '\r\n');
        });
        ft.write('----------\u5206\u5272\u7EBF------------\r\n\r\n');
        fq.push({ index: index, ipcs: group });
    });
    fj.write(JSON.stringify(fq));
    fh.close();
    fj.close();
    var getFqIndex = function getFqIndex(name) {
        return _.find(fq, function (fqi) {
            return fqi.ipcs === name;
        }).index;
    };

    var m2 = [];
    _.each(p, function (pi, hostID) {
        var hostRange = [];
        _.each(pi, function (ranges, ipcs) {
            var fqIndex = getFqIndex(ipcs);
            _.each(ranges, function (range) {
                hostRange.push({ distance: range.max, index: fqIndex });
            });
        });
        hostRange = _.sortBy(hostRange, 'distance');
        m2.push({ id: hostID, partition: hostRange });
    });
    fhj.write(JSON.stringify(m2));
    fhj.close();
}

exports = module.exports = {
    upgrade: upgrade
};
//# sourceMappingURL=data_upgrade.js.map