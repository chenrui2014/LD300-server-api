'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Transform = require('stream').Transform;
var PassThrough = require('stream').PassThrough;
var assert = require('assert');
var config = require('../config/config');
var dhlib = require('../ipcs/dahua/dhnetsdk');
var path = require('path');
var root = require('../config/config').root;
var Event = require('events').EventEmitter;
var amf = require('amf');
var expect = require('chai').expect;
var _ = require('lodash');
var cp = require('child_process');

/**
 * describe 测试套件 test suite 表示一组相关的测试
 * it 测试用例 test case 表示一个单独的测试
 * assert 断言 表示对结果的预期
 */

var B = function () {
    function B() {
        _classCallCheck(this, B);

        this.x = 1;
    }

    _createClass(B, [{
        key: 'funA',
        value: function funA() {}
    }, {
        key: 'a',
        get: function get() {
            return this.x;
        }
    }, {
        key: 'b',
        get: function get() {
            return 2;
        }
    }]);

    return B;
}();

var A = function (_Transform) {
    _inherits(A, _Transform);

    function A() {
        _classCallCheck(this, A);

        return _possibleConstructorReturn(this, (A.__proto__ || Object.getPrototypeOf(A)).call(this));
        //B.call(this); error not new
    }

    _createClass(A, [{
        key: '_transform',
        value: function _transform(d, e, n) {
            n(null, d);
        }
    }, {
        key: 'a',
        get: function get() {
            return B.prototype.a.call(this);
        }
    }]);

    return A;
}(Transform);

var Rotate = function (_Transform2) {
    _inherits(Rotate, _Transform2);

    function Rotate(n) {
        _classCallCheck(this, Rotate);

        // 将字母旋转`n`个位置
        var _this2 = _possibleConstructorReturn(this, (Rotate.__proto__ || Object.getPrototypeOf(Rotate)).call(this));

        _this2.offset = (n || 13) % 26;
        return _this2;
    }

    // 将可写端写入的数据变换后添加到可读端


    _createClass(Rotate, [{
        key: '_transform',
        value: function _transform(buf, enc, next) {
            var _this3 = this;

            var res = buf.toString().split('').map(function (c) {
                var code = c.charCodeAt(0);
                if (c >= 'a' && c <= 'z') {
                    code += _this3.offset;
                    if (code > 'z'.charCodeAt(0)) {
                        code -= 26;
                    }
                } else if (c >= 'A' && c <= 'Z') {
                    code += _this3.offset;
                    if (code > 'Z'.charCodeAt(0)) {
                        code -= 26;
                    }
                }
                return String.fromCharCode(code);
            }).join('');

            // 调用push方法将变换后的数据添加到可读端
            this.push(res);
            // 调用next方法准备处理下一个
            next();
        }
    }]);

    return Rotate;
}(Transform);

xdescribe('buffer', function () {
    it('0 test', function () {
        var buf = buffer.from([0]);
        buf.toString('');
    });
});

describe('amf', function () {
    xit('read', function () {
        var b = Buffer.from('080000000900086475726174696f6e000000000000000000000577696474680040760000000000000006686569676874004072000000000000000d766964656f646174617261746500000000000000000000096672616d6572617465004059000000000000000c766964656f636f646563696400401c00000000000000057469746c65020010525453502053657373696f6e2f322e300007656e636f64657202000d4c61766635372e37352e313030000866696c6573697a65000000000000000000000009', 'hex');
        var obj = amf.read(b, 0);
        console.log(obj);
    });
    it('write', function () {
        var buf = Buffer.allocUnsafe(400);
        var b = Buffer.from('080000000900086475726174696f6e000000000000000000000577696474680040760000000000000006686569676874004072000000000000000d766964656f646174617261746500000000000000000000096672616d6572617465004059000000000000000c766964656f636f646563696400401c00000000000000057469746c65020010525453502053657373696f6e2f322e300007656e636f64657202000d4c61766635372e37352e313030000866696c6573697a65000000000000000000000009', 'hex');
        var obj = amf.read(b, 0);
        var arr = [];
        _.defaults(arr, obj);
        arr.length = _.keys(obj).length;
        var info = {};
        amf.write(buf, arr, info);
        var b2 = buf.slice(0, info.byteLength);
        assert.deepEqual(b, b2);
    });
});

xdescribe('transform-data', function () {
    it('do', function () {
        var transform = new Rotate(3);
        transform.on('data', function (data) {
            return process.stdout.write(data);
        });
        transform.write('hello, ');
        transform.write('world!');
        transform.end();
    });
});

xdescribe('pipe', function () {
    it('m-pipe', function () {
        var a = new A();
        var pt = new PassThrough();
        a.pipe(pt);
        a.pipe(pt);
        pt.on('data', console.log);
        a.write('hello');
        a.end();
    });
    xit('event count', function (done) {
        var a = new A();
        a.on('newListener', function (name) {
            console.log('new Event:' + name + ',Count:' + a.listenerCount(name));
        });
        a.on('removeListener', function (name) {
            console.log('remove Event:' + name + ',Count:' + a.listenerCount(name));
        });
        var d = function d() {};
        a.on('data', d);
        expect(a.listenerCount('data')).equal(1);
        a.removeListener('data', d);
        expect(a.listenerCount('data')).equal(0);
        var pt = new PassThrough();
        a.pipe(pt);
        a.end();
        expect(a.listenerCount('data')).equal(1);
        a.unpipe(pt);
        expect(a.listenerCount('data')).equal(0);
        setTimeout(function () {
            done();
        }, 10);
    });
});

xdescribe('集成附加组件', function () {
    it('sub.call', function () {
        var b = new A();
        expect(b.x).equal(1);
        expect(b.a).equal(1);
    });
});

xdescribe('promise', function () {
    function a() {
        return new Promise(function (s, f) {
            f('err t');
        });
    }
    function b() {
        return a().then(function () {});
    }
    it('promise/a+', function (done) {
        b().then(done).catch(done);
    });
});

xdescribe('enum', function () {
    it('enum', function () {
        console.log(dhlib.enums.loginType.get(0).key);
    });
});

xdescribe('path', function () {
    it('代码路劲', function () {
        console.log(__dirname);
        console.log(path.resolve(root, 'app'));
    });
});

xdescribe('Array', function () {

    describe('#indexOf()', function () {

        function pc(cb, v) {
            var _this4 = this;

            this.v = v;
            process.nextTick(function () {
                cb(_this4.v);
            });
        }

        it('process.nextTick', function () {
            new pc(console.log, 'abc');
            console.log('123');
        });

        xit('should return -1 when the value is not present', function () {
            assert.equal(-1, [1, 2, 3].indexOf(4));
        });

        xit('length', function () {
            assert.equal(3, [1, 2, 3].length);
        });
    });
});

xdescribe('lodash', function () {
    it('defaults', function () {
        var a = [];
        a.a = 1;
        var b = { b: 2 };
        assert.deepEqual(a, _.defaults(a, b));
    });
});

describe('array', function () {
    xit('each', function () {
        var x = [];x[3] = 1;
        var z = _.without(x);
        console.log(z);
        console.log(x);
        _.forEach(x, function (xi) {
            console.log(xi);
        });
        x.forEach(function (xi) {
            console.log(xi);
        });
        var y = Array.from(x);
        console.log(y);
        var a = x.filter(function (i) {
            return i;
        });
        console.log(a);
        var b = _.filter(x, function (z) {
            return z;
        });
    });

    it('lodash.remove', function () {
        var x = [0, 1, 2];
        _.remove(x, function (i) {
            return i;
        });
        assert.ok(x.length === 1);
    });
});

describe('async测试', function () {
    var abc = function () {
        var _ref = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            console.log('async');
                            return _context.abrupt('return', new Promise(function (resolve) {
                                setTimeout(function () {
                                    resolve(1);
                                }, 10);
                            }));

                        case 2:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, this);
        }));

        return function abc() {
            return _ref.apply(this, arguments);
        };
    }();

    var applyTest = function () {
        var _ref4 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee4(num1, num2) {
            return _regenerator2.default.wrap(function _callee4$(_context4) {
                while (1) {
                    switch (_context4.prev = _context4.next) {
                        case 0:
                            return _context4.abrupt('return', new Promise(function (resolve) {
                                setTimeout(function () {
                                    resolve(num1 + num2);
                                }, 10);
                            }));

                        case 1:
                        case 'end':
                            return _context4.stop();
                    }
                }
            }, _callee4, this);
        }));

        return function applyTest(_x2, _x3) {
            return _ref4.apply(this, arguments);
        };
    }();

    var Throw = function () {
        var _ref6 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee6() {
            return _regenerator2.default.wrap(function _callee6$(_context6) {
                while (1) {
                    switch (_context6.prev = _context6.next) {
                        case 0:
                            _context6.next = 2;
                            return Promise.reject(1);

                        case 2:
                        case 'end':
                            return _context6.stop();
                    }
                }
            }, _callee6, this);
        }));

        return function Throw() {
            return _ref6.apply(this, arguments);
        };
    }();

    //error


    it('map-async', function (done) {
        var x = [1, 2, 3, 4];
        x.map(function () {
            var _ref2 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee2(xi) {
                return _regenerator2.default.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                if (!(xi === 1)) {
                                    _context2.next = 7;
                                    break;
                                }

                                _context2.next = 3;
                                return abc();

                            case 3:
                                console.log(xi);
                                done();
                                _context2.next = 8;
                                break;

                            case 7:
                                console.log(xi);

                            case 8:
                            case 'end':
                                return _context2.stop();
                        }
                    }
                }, _callee2, undefined);
            }));

            return function (_x) {
                return _ref2.apply(this, arguments);
            };
        }());
    });
    it('1', _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee3() {
        var x, y;
        return _regenerator2.default.wrap(function _callee3$(_context3) {
            while (1) {
                switch (_context3.prev = _context3.next) {
                    case 0:
                        _context3.next = 2;
                        return abc();

                    case 2:
                        x = _context3.sent;

                        console.log('x');
                        _context3.next = 6;
                        return Promise.resolve(2);

                    case 6:
                        y = _context3.sent;

                        console.log('y');
                        expect(x).equal(1);

                    case 9:
                    case 'end':
                        return _context3.stop();
                }
            }
        }, _callee3, undefined);
    })));

    it('promise-function.apply', function (done) {
        applyTest.apply(undefined, [1, 2]).then(function (sum) {
            expect(sum).equal(3);
            done();
        });
    });

    it('async-function.apply', _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee5() {
        var sum;
        return _regenerator2.default.wrap(function _callee5$(_context5) {
            while (1) {
                switch (_context5.prev = _context5.next) {
                    case 0:
                        _context5.next = 2;
                        return applyTest.apply(undefined, [1, 2]);

                    case 2:
                        sum = _context5.sent;

                        expect(sum).equal(3);

                    case 4:
                    case 'end':
                        return _context5.stop();
                }
            }
        }, _callee5, undefined);
    })));

    it('async-function.apply-_.partial', function (done) {
        var fun = _.partial(applyTest, 1);
        fun(2).then(function (sum) {
            expect(sum).equal(3);
            done();
        });
    });

    it('catch', _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee7() {
        var x;
        return _regenerator2.default.wrap(function _callee7$(_context7) {
            while (1) {
                switch (_context7.prev = _context7.next) {
                    case 0:
                        _context7.next = 2;
                        return Throw().catch(function () {
                            return Promise.resolve(2);
                        });

                    case 2:
                        x = _context7.sent;

                        console.log(x);

                    case 4:
                    case 'end':
                        return _context7.stop();
                }
            }
        }, _callee7, undefined);
    })));
});

describe('cp', function () {
    it('fork', function () {
        var file = path.resolve(__dirname, './init.js');
        cp.fork(file, ['--inspect', '--debug-brk=' + 12000]);
    });
});
//# sourceMappingURL=test.js.map