'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var _require = require('../init'),
    db = _require.db,
    file = _require.file;

var M = require('../../servers/ipc_mointors');
var expect = require('chai').expect;

var data = [{
    id: 5, //ipcid
    point: 700, //距离
    demo: true, //是否球机
    preset: { "x": 1, "y": 1, "z": 1, preset: '1' //球机预置点信息
    } }, {
    id: 5, //ipcid
    point: 900, //距离
    demo: true, //是否球机
    preset: { "x": 16, "y": 1, "z": 1, preset: '1' //球机预置点信息
    } }, {
    id: 5, //ipcid
    point: 800, //距离
    demo: true, //是否球机
    preset: { "x": 10, "y": 1, "z": 1, preset: '2' //球机预置点信息
    } }, {
    id: 2,
    point: 780,
    demo: false
}, {
    id: 2,
    point: 790,
    demo: false
}];

describe('监控测试', function () {
    var dbInstance = null;
    before(_asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        _context.next = 2;
                        return file();

                    case 2:
                        dbInstance = _context.sent;

                    case 3:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, undefined);
    })));

    var mt = new M(1);
    mt._setMointor(data);
    var m = mt._mointors;
    it('测试数据初始化', function () {
        expect(!m['5']).equal(false);
        expect(!m['2']).equal(false);
        var m5 = m['5'];
        expect(m5.range[0]).equal(700);
        expect(m5.range[1]).equal(900);
        expect(m5.points.length).equal(3);
        expect(m5.points[0].point).equal(m5.range[0]);
        expect(m5.points[1].point).equal(800);
        expect(m5.points[2].point).equal(m5.range[1]);
        expect(m5.id).equal(5);
        expect(m5.demo).equal(true);
    });

    it('范围划定--左', function () {
        var mx = mt.getMointors(700);
        expect(mx.length).equal(1);
        var mx0 = mx[0];
        expect(mx0.id).equal(5);
        expect(mx0.x).equal(1);
    });

    it('范围划定-右', function () {
        var mx = mt.getMointors(800);
        expect(mx.length).equal(1);
        var mx0 = mx[0];
        expect(mx0.id).equal(5);
        expect(mx0.x).equal(10);
    });

    it('球机插值位置计算-中', function () {
        var mx = mt.getMointors(750);
        expect(mx.length).equal(1);
        var mx0 = mx[0];
        expect(mx0.id).equal(5);
        expect(mx0.x > 1).equal(true);
        expect(mx0.x < 10).equal(true);
    });
});
//# sourceMappingURL=ipc_mointor.test.js.map