'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Created by chen on 17-8-23.
 */
//import logger from '../logger';
//import PerimeterPointModel from '../models/perimeterPoint.model';
//import uuidv1 from 'uuid/v1';

var _require = require('../log/log'),
    Parser = _require.Parser;

var logger = {};
Parser(logger, 'PerimeterPointService.js');
var PerimeterPointModel = require('../models/perimeterPoint.model');
var uuidv1 = require('uuid/v1');

var PerimeterPointService = function () {
    function PerimeterPointService() {
        _classCallCheck(this, PerimeterPointService);
    }

    _createClass(PerimeterPointService, null, [{
        key: 'add_perimeterPoint',

        /**
         * 添加一个周界点
         * @param data 需要添加的周界点数据
         * @returns {Promise.<boolean>} 添加成功返回true，否则返回false；
         */
        value: function () {
            var _ref = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee(data) {
                var success;
                return _regenerator2.default.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                // const id = await PerimeterPointService.findMaxId();
                                // data.id = Number(id) + 1;
                                // let perimeterPoint = new PerimeterPointModel(data);
                                data.id = uuidv1();
                                success = false;
                                _context.next = 4;
                                return PerimeterPointModel.create(data, function (err, perimeterPoint) {
                                    if (!err) {
                                        success = true;
                                        logger.info('添加周界点成功');
                                    } else {
                                        logger.error(err.message);
                                    }
                                });

                            case 4:
                                return _context.abrupt('return', success);

                            case 5:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));

            function add_perimeterPoint(_x) {
                return _ref.apply(this, arguments);
            }

            return add_perimeterPoint;
        }()
    }, {
        key: 'add_list',
        value: function () {
            var _ref2 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee2(data) {
                var success, i, len;
                return _regenerator2.default.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                success = true;

                                if (!Array.isArray(data)) {
                                    _context2.next = 10;
                                    break;
                                }

                                i = 0, len = data.length;

                            case 3:
                                if (!(i < len)) {
                                    _context2.next = 10;
                                    break;
                                }

                                _context2.next = 6;
                                return PerimeterPointService.add_perimeterPoint(data[i]);

                            case 6:
                                success = _context2.sent;

                            case 7:
                                i++;
                                _context2.next = 3;
                                break;

                            case 10:
                                return _context2.abrupt('return', success);

                            case 11:
                            case 'end':
                                return _context2.stop();
                        }
                    }
                }, _callee2, this);
            }));

            function add_list(_x2) {
                return _ref2.apply(this, arguments);
            }

            return add_list;
        }()

        /**
         * 根据条件删除周界点
         * @param conditions 删除条件
         * @returns {Promise.<boolean>}删除成功返回true，否则返回false；
         */

    }, {
        key: 'delete_perimeterPoint',
        value: function () {
            var _ref3 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee3(conditions) {
                var success, result;
                return _regenerator2.default.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                success = false;
                                _context3.next = 3;
                                return PerimeterPointModel.remove(conditions, function (err, perimeterPoint) {
                                    if (!err) {
                                        success = true;
                                        logger.info('删除周界点[' + perimeterPoint.realPosition + ']成功');
                                    } else {
                                        logger.error(err.message);
                                    }
                                });

                            case 3:
                                result = _context3.sent;
                                return _context3.abrupt('return', success);

                            case 5:
                            case 'end':
                                return _context3.stop();
                        }
                    }
                }, _callee3, this);
            }));

            function delete_perimeterPoint(_x3) {
                return _ref3.apply(this, arguments);
            }

            return delete_perimeterPoint;
        }()

        /**
         * 修改周界点信息
         * @param conditions 修改条件
         * @param data 新的周界点数据
         * @returns {Promise.<*>} 返回修改后的数据
         */

    }, {
        key: 'edit_perimeterPoint',
        value: function () {
            var _ref4 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee4(conditions, data) {
                var result;
                return _regenerator2.default.wrap(function _callee4$(_context4) {
                    while (1) {
                        switch (_context4.prev = _context4.next) {
                            case 0:
                                result = null;
                                _context4.next = 3;
                                return PerimeterPointModel.update(conditions, data).exec();

                            case 3:
                                result = _context4.sent;
                                return _context4.abrupt('return', result);

                            case 5:
                            case 'end':
                                return _context4.stop();
                        }
                    }
                }, _callee4, this);
            }));

            function edit_perimeterPoint(_x4, _x5) {
                return _ref4.apply(this, arguments);
            }

            return edit_perimeterPoint;
        }()

        /**
         * 根据条件查询符合条件的周界点数量
         * @param conditions
         * @returns {Promise.<*>}
         */

    }, {
        key: 'getTotal',
        value: function () {
            var _ref5 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee5(conditions) {
                return _regenerator2.default.wrap(function _callee5$(_context5) {
                    while (1) {
                        switch (_context5.prev = _context5.next) {
                            case 0:
                                _context5.next = 2;
                                return PerimeterPointModel.find(conditions).count();

                            case 2:
                                return _context5.abrupt('return', _context5.sent);

                            case 3:
                            case 'end':
                                return _context5.stop();
                        }
                    }
                }, _callee5, this);
            }));

            function getTotal(_x6) {
                return _ref5.apply(this, arguments);
            }

            return getTotal;
        }()

        /**
         * 查询所有周界点
         * @returns {Promise.<*>}
         */

    }, {
        key: 'findAll',
        value: function () {
            var _ref6 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee6(sort) {
                return _regenerator2.default.wrap(function _callee6$(_context6) {
                    while (1) {
                        switch (_context6.prev = _context6.next) {
                            case 0:
                                if (!sort) {
                                    _context6.next = 6;
                                    break;
                                }

                                _context6.next = 3;
                                return PerimeterPointModel.find().sort(sort);

                            case 3:
                                return _context6.abrupt('return', _context6.sent);

                            case 6:
                                _context6.next = 8;
                                return PerimeterPointModel.find();

                            case 8:
                                return _context6.abrupt('return', _context6.sent);

                            case 9:
                            case 'end':
                                return _context6.stop();
                        }
                    }
                }, _callee6, this);
            }));

            function findAll(_x7) {
                return _ref6.apply(this, arguments);
            }

            return findAll;
        }()

        /**
         * 根据条件查询周界点
         * @param conditions 查询条件
         * @param sort 排序
         * @param pagination 分页
         * @returns {Promise.<*>} 返回查询到的数据
         */

    }, {
        key: 'find_perimeterPoint',
        value: function () {
            var _ref7 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee7(conditions, sort, pagination) {
                var result;
                return _regenerator2.default.wrap(function _callee7$(_context7) {
                    while (1) {
                        switch (_context7.prev = _context7.next) {
                            case 0:
                                result = null;

                                if (!sort) {
                                    _context7.next = 13;
                                    break;
                                }

                                if (!pagination) {
                                    _context7.next = 8;
                                    break;
                                }

                                _context7.next = 5;
                                return PerimeterPointModel.find(conditions).skip(pagination.pageStart).limit(pagination.pageSize).sort(sort);

                            case 5:
                                result = _context7.sent;
                                _context7.next = 11;
                                break;

                            case 8:
                                _context7.next = 10;
                                return PerimeterPointModel.find().sort(sort);

                            case 10:
                                result = _context7.sent;

                            case 11:
                                _context7.next = 22;
                                break;

                            case 13:
                                if (!pagination) {
                                    _context7.next = 19;
                                    break;
                                }

                                _context7.next = 16;
                                return PerimeterPointModel.find(conditions).skip(pagination.pageStart).limit(pagination.pageSize);

                            case 16:
                                result = _context7.sent;
                                _context7.next = 22;
                                break;

                            case 19:
                                _context7.next = 21;
                                return PerimeterPointModel.find(conditions);

                            case 21:
                                result = _context7.sent;

                            case 22:
                                return _context7.abrupt('return', result);

                            case 23:
                            case 'end':
                                return _context7.stop();
                        }
                    }
                }, _callee7, this);
            }));

            function find_perimeterPoint(_x8, _x9, _x10) {
                return _ref7.apply(this, arguments);
            }

            return find_perimeterPoint;
        }()

        /**
         * 根据ID查找周界点信息
         * @param id
         * @returns {Promise.<*>}
         */

    }, {
        key: 'find_one',
        value: function () {
            var _ref8 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee8(id) {
                return _regenerator2.default.wrap(function _callee8$(_context8) {
                    while (1) {
                        switch (_context8.prev = _context8.next) {
                            case 0:
                                _context8.next = 2;
                                return PerimeterPointModel.findOne({ id: id });

                            case 2:
                                return _context8.abrupt('return', _context8.sent);

                            case 3:
                            case 'end':
                                return _context8.stop();
                        }
                    }
                }, _callee8, this);
            }));

            function find_one(_x11) {
                return _ref8.apply(this, arguments);
            }

            return find_one;
        }()

        /**
         * 获得ID最大值
         * @returns {Promise.<number>}
         */

    }, {
        key: 'findMaxId',
        value: function () {
            var _ref9 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee9() {
                var result;
                return _regenerator2.default.wrap(function _callee9$(_context9) {
                    while (1) {
                        switch (_context9.prev = _context9.next) {
                            case 0:
                                _context9.next = 2;
                                return PerimeterPointModel.find().sort({ id: -1 }).limit(1);

                            case 2:
                                result = _context9.sent;

                                if (!(result && result.length > 0)) {
                                    _context9.next = 7;
                                    break;
                                }

                                return _context9.abrupt('return', result[0]._doc.id);

                            case 7:
                                return _context9.abrupt('return', 0);

                            case 8:
                            case 'end':
                                return _context9.stop();
                        }
                    }
                }, _callee9, this);
            }));

            function findMaxId() {
                return _ref9.apply(this, arguments);
            }

            return findMaxId;
        }()

        /**
         * 根据条件判断是否存在符合条件的周界点
         * @param conditions 查询条件
         * @returns {Promise.<boolean>} 有符合条件的对象返回true，否则返回false
         */

    }, {
        key: 'isExist',
        value: function () {
            var _ref10 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee10(conditions) {
                var result;
                return _regenerator2.default.wrap(function _callee10$(_context10) {
                    while (1) {
                        switch (_context10.prev = _context10.next) {
                            case 0:
                                _context10.next = 2;
                                return PerimeterPointModel.find(conditions);

                            case 2:
                                result = _context10.sent;

                                if (!(result && result.length > 0)) {
                                    _context10.next = 7;
                                    break;
                                }

                                return _context10.abrupt('return', true);

                            case 7:
                                return _context10.abrupt('return', false);

                            case 8:
                            case 'end':
                                return _context10.stop();
                        }
                    }
                }, _callee10, this);
            }));

            function isExist(_x12) {
                return _ref10.apply(this, arguments);
            }

            return isExist;
        }()
    }]);

    return PerimeterPointService;
}();

exports = module.exports = PerimeterPointService;
//export default PerimeterPointService;
//# sourceMappingURL=perimeterPointService.js.map