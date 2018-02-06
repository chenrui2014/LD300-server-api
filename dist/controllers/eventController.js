'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _eventService = require('../services/eventService');

var _eventService2 = _interopRequireDefault(_eventService);

var _hostService = require('../services/hostService');

var _hostService2 = _interopRequireDefault(_hostService);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Created by chen on 17-8-23.
 */
var _require = require('../log/log'),
    Parser = _require.Parser;

var logger = {};
Parser(logger, 'EventController.js');

//const uuidv1=require('uuid/v1');

var EventController = function () {
    function EventController() {
        _classCallCheck(this, EventController);
    }

    _createClass(EventController, null, [{
        key: 'add_event',
        value: function () {
            var _ref = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee(ctx) {
                var data, isExist, result, msg;
                return _regenerator2.default.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                data = ctx.request.body;

                                logger.info(data);

                                if (data) {
                                    _context.next = 4;
                                    break;
                                }

                                return _context.abrupt('return', ctx.error = { msg: '发送数据失败!' });

                            case 4:
                                _context.next = 6;
                                return _eventService2.default.isExist({ typeCode: data.typeCode });

                            case 6:
                                isExist = _context.sent;

                                if (!isExist) {
                                    _context.next = 9;
                                    break;
                                }

                                return _context.abrupt('return', ctx.error = { msg: '类型编码为[' + data.typeCode + ']的事件已存在!' });

                            case 9:
                                _context.next = 11;
                                return _eventService2.default.add_event(data);

                            case 11:
                                result = _context.sent;
                                msg = '';

                                if (!result) {
                                    _context.next = 18;
                                    break;
                                }

                                msg = '添加事件' + data.typeCode + '成功';
                                return _context.abrupt('return', ctx.body = { msg: msg, data: data });

                            case 18:
                                msg = '添加失败';
                                return _context.abrupt('return', ctx.error = { msg: msg });

                            case 20:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));

            function add_event(_x) {
                return _ref.apply(this, arguments);
            }

            return add_event;
        }()
    }, {
        key: 'delete_event',
        value: function () {
            var _ref2 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee2(ctx) {
                var id, result, msg;
                return _regenerator2.default.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                id = ctx.params.id;
                                _context2.next = 3;
                                return _eventService2.default.delete_event({ id: id });

                            case 3:
                                result = _context2.sent;
                                msg = '';

                                if (!result) {
                                    _context2.next = 10;
                                    break;
                                }

                                msg = '删除事件成功';
                                return _context2.abrupt('return', ctx.body = { msg: msg, data: result });

                            case 10:
                                msg = '删除事件失败';
                                return _context2.abrupt('return', ctx.error = { msg: msg });

                            case 12:
                            case 'end':
                                return _context2.stop();
                        }
                    }
                }, _callee2, this);
            }));

            function delete_event(_x2) {
                return _ref2.apply(this, arguments);
            }

            return delete_event;
        }()
    }, {
        key: 'edit_event',
        value: function () {
            var _ref3 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee3(ctx) {
                var data, _id, result;

                return _regenerator2.default.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                data = ctx.request.body;

                                logger.info(data);
                                _id = data._id;

                                delete data._id;
                                _context3.next = 6;
                                return _eventService2.default.edit_event({ _id: _id }, data);

                            case 6:
                                result = _context3.sent;

                                if (!result) {
                                    _context3.next = 9;
                                    break;
                                }

                                return _context3.abrupt('return', ctx.body = { msg: '修改事件成功', data: result });

                            case 9:
                                return _context3.abrupt('return', ctx.error = { msg: '修改事件失败!' });

                            case 10:
                            case 'end':
                                return _context3.stop();
                        }
                    }
                }, _callee3, this);
            }));

            function edit_event(_x3) {
                return _ref3.apply(this, arguments);
            }

            return edit_event;
        }()
    }, {
        key: 'find_event',
        value: function () {
            var _ref4 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee4(ctx) {
                var _ctx$query, sort, range, filter, sortObj, rangeObj, filterObj, obj, sortP, pageStart, pageEnd, total, pagination, result, _pageStart, _pageEnd, _pagination, _pageStart2, _pageEnd2, _pagination2, hosts;

                return _regenerator2.default.wrap(function _callee4$(_context4) {
                    while (1) {
                        switch (_context4.prev = _context4.next) {
                            case 0:
                                _ctx$query = ctx.query, sort = _ctx$query.sort, range = _ctx$query.range, filter = _ctx$query.filter;
                                sortObj = null;

                                if (sort) {
                                    sortObj = JSON.parse(sort);
                                }

                                rangeObj = null;

                                if (range) {
                                    rangeObj = JSON.parse(range);
                                }

                                filterObj = null;

                                if (filter && "{}" !== filter) {
                                    obj = JSON.parse(filter);

                                    if (obj && Array.isArray(obj.id)) {
                                        filterObj = { id: { $in: obj.id } };
                                    } else {
                                        filterObj = obj;
                                    }
                                }
                                sortP = {};

                                if (sortObj && sortObj.length >= 2) {
                                    if ('ASC' === sortObj[1]) {
                                        sortP[sortObj[0]] = 1;
                                    } else {
                                        sortP[sortObj[0]] = -1;
                                    }
                                }

                                pageStart = 0, pageEnd = 0;

                                if (rangeObj && rangeObj.length >= 2) {
                                    pageStart = rangeObj[0];
                                    pageEnd = rangeObj[1];
                                }

                                _context4.next = 13;
                                return _eventService2.default.getTotal();

                            case 13:
                                total = _context4.sent;
                                pagination = {};

                                pagination.pageStart = pageStart;
                                pagination.pageSize = pageEnd - pageStart + 1;
                                result = null;

                                if (!sortP) {
                                    _context4.next = 35;
                                    break;
                                }

                                if (!rangeObj) {
                                    _context4.next = 30;
                                    break;
                                }

                                _pageStart = 0, _pageEnd = 0;

                                if (rangeObj && rangeObj.length >= 2) {
                                    _pageStart = rangeObj[0];
                                    _pageEnd = rangeObj[1];
                                }
                                _pagination = {};

                                _pagination.pageStart = _pageStart;
                                _pagination.pageSize = _pageEnd - _pageStart + 25;
                                _context4.next = 27;
                                return _eventService2.default.find_event(filterObj, sortP, _pagination);

                            case 27:
                                result = _context4.sent;
                                _context4.next = 33;
                                break;

                            case 30:
                                _context4.next = 32;
                                return _eventService2.default.find_event(filterObj, sortP);

                            case 32:
                                result = _context4.sent;

                            case 33:
                                _context4.next = 49;
                                break;

                            case 35:
                                if (!rangeObj) {
                                    _context4.next = 46;
                                    break;
                                }

                                _pageStart2 = 0, _pageEnd2 = 0;

                                if (rangeObj && rangeObj.length >= 2) {
                                    _pageStart2 = rangeObj[0];
                                    _pageEnd2 = rangeObj[1];
                                }
                                _pagination2 = {};

                                _pagination2.pageStart = _pageStart2;
                                _pagination2.pageSize = _pageEnd2 - _pageStart2 + 25;
                                _context4.next = 43;
                                return _eventService2.default.find_event(filterObj, null, _pagination2);

                            case 43:
                                result = _context4.sent;
                                _context4.next = 49;
                                break;

                            case 46:
                                _context4.next = 48;
                                return _eventService2.default.find_event(filterObj);

                            case 48:
                                result = _context4.sent;

                            case 49:
                                _context4.next = 51;
                                return _hostService2.default.findAll({ port: 1 });

                            case 51:
                                hosts = _context4.sent;

                                //const cameras = await CamerasService.findAll({id:1});
                                if (result && result.length > 0) {
                                    result.map(function (item, i) {

                                        if (hosts && hosts.length > 0) {
                                            hosts.forEach(function (host /*,index,arr*/) {
                                                if (item.hid === host.id) {
                                                    item._doc.port = host.port;
                                                }
                                            });
                                        }
                                        // if(cameras && cameras.length > 0){
                                        //     hosts.forEach(function (camera,index,arr) {
                                        //         if(item.pid === camera.id){
                                        //             item.ip = host.ip;
                                        //         }
                                        //    });
                                        // }

                                        return item;
                                    });
                                }
                                // let result = await EventService.find_event(filterObj,sortP,pagination);

                                if (!result) {
                                    _context4.next = 55;
                                    break;
                                }

                                return _context4.abrupt('return', ctx.body = { msg: '查询事件', data: result, total: total });

                            case 55:
                                return _context4.abrupt('return', ctx.error = { msg: '没有找到事件!' });

                            case 56:
                            case 'end':
                                return _context4.stop();
                        }
                    }
                }, _callee4, this);
            }));

            function find_event(_x4) {
                return _ref4.apply(this, arguments);
            }

            return find_event;
        }()
    }, {
        key: 'find_eventVideo',
        value: function () {
            var _ref5 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee5(ctx) {
                var filter, filterObj, obj, result, videos;
                return _regenerator2.default.wrap(function _callee5$(_context5) {
                    while (1) {
                        switch (_context5.prev = _context5.next) {
                            case 0:
                                filter = ctx.query.filter;
                                filterObj = null;

                                if (filter && "{}" !== filter) {
                                    obj = JSON.parse(filter);

                                    if (obj && Array.isArray(obj.id)) {
                                        filterObj = { id: { $in: obj.id } };
                                    } else {
                                        filterObj = obj;
                                    }
                                }

                                _context5.next = 5;
                                return _eventService2.default.find_event({ id: filterObj.eventId });

                            case 5:
                                result = _context5.sent;
                                videos = [];

                                if (result && result.length > 0) {
                                    result.forEach(function (event) {
                                        event.video.map(function (item, i) {
                                            item._doc.eventId = event.id;
                                            //item._doc.id = uuidv1();
                                            return item;
                                        });
                                        event.video.forEach(function (video) {
                                            videos.push(video);
                                        });
                                    });
                                }

                                if (!videos) {
                                    _context5.next = 10;
                                    break;
                                }

                                return _context5.abrupt('return', ctx.body = { msg: '事件关联摄像头', total: videos.length, data: videos });

                            case 10:
                            case 'end':
                                return _context5.stop();
                        }
                    }
                }, _callee5, this);
            }));

            function find_eventVideo(_x5) {
                return _ref5.apply(this, arguments);
            }

            return find_eventVideo;
        }()
    }, {
        key: 'findVideo_one',
        value: function () {
            var _ref6 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee6(ctx) {
                var id, result, video;
                return _regenerator2.default.wrap(function _callee6$(_context6) {
                    while (1) {
                        switch (_context6.prev = _context6.next) {
                            case 0:
                                id = ctx.params.id;
                                _context6.next = 3;
                                return _eventService2.default.find_event({ video: [{ id: id }] }, null, null);

                            case 3:
                                result = _context6.sent;
                                video = null;

                                if (result && result.length > 0) {
                                    video = result[0].video.filter(function (item) {
                                        return item.id == id;
                                    });
                                }

                                if (!video) {
                                    _context6.next = 8;
                                    break;
                                }

                                return _context6.abrupt('return', ctx.body = { msg: '查询事件', data: video });

                            case 8:
                                return _context6.abrupt('return', ctx.error = { msg: '调取录像失败!' });

                            case 9:
                            case 'end':
                                return _context6.stop();
                        }
                    }
                }, _callee6, this);
            }));

            function findVideo_one(_x6) {
                return _ref6.apply(this, arguments);
            }

            return findVideo_one;
        }()
    }, {
        key: 'find_event_noPage',
        value: function () {
            var _ref7 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee7(ctx) {
                var sort, sortObj, sortP, result, hosts;
                return _regenerator2.default.wrap(function _callee7$(_context7) {
                    while (1) {
                        switch (_context7.prev = _context7.next) {
                            case 0:
                                sort = ctx.query.sort;
                                sortObj = JSON.parse(sort);
                                sortP = {};

                                if (sortObj && sortObj.length >= 2) {
                                    if ('ASC' === sortObj[1]) {
                                        sortP[sortObj[0]] = 1;
                                    } else {
                                        sortP[sortObj[0]] = -1;
                                    }
                                }
                                _context7.next = 6;
                                return _eventService2.default.find_event(null, sortP, null);

                            case 6:
                                result = _context7.sent;
                                _context7.next = 9;
                                return _hostService2.default.findAll({ port: 1 });

                            case 9:
                                hosts = _context7.sent;

                                //const cameras = await CamerasService.findAll({id:1});
                                if (result && result.length > 0) {
                                    result.map(function (item, i) {

                                        if (hosts && hosts.length > 0) {
                                            hosts.forEach(function (host /*,index,arr*/) {
                                                if (item.hid === host.id) {
                                                    item._doc.port = host.port;
                                                }
                                            });
                                        }
                                        // if(cameras && cameras.length > 0){
                                        //     hosts.forEach(function (camera,index,arr) {
                                        //         if(item.pid === camera.id){
                                        //             item.ip = host.ip;
                                        //         }
                                        //    });
                                        // }

                                        return item;
                                    });
                                }

                                if (!result) {
                                    _context7.next = 13;
                                    break;
                                }

                                return _context7.abrupt('return', ctx.body = { msg: '查询事件', data: result });

                            case 13:
                                return _context7.abrupt('return', ctx.error = { msg: '没有找到事件!' });

                            case 14:
                            case 'end':
                                return _context7.stop();
                        }
                    }
                }, _callee7, this);
            }));

            function find_event_noPage(_x7) {
                return _ref7.apply(this, arguments);
            }

            return find_event_noPage;
        }()
    }, {
        key: 'find_one',
        value: function () {
            var _ref8 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee8(ctx) {
                var id, result, hosts;
                return _regenerator2.default.wrap(function _callee8$(_context8) {
                    while (1) {
                        switch (_context8.prev = _context8.next) {
                            case 0:
                                id = ctx.params.id;
                                _context8.next = 3;
                                return _eventService2.default.find_one(id);

                            case 3:
                                result = _context8.sent;
                                _context8.next = 6;
                                return _hostService2.default.findAll({ port: 1 });

                            case 6:
                                hosts = _context8.sent;

                                if (result) {
                                    if (hosts && hosts.length > 0) {
                                        hosts.forEach(function (host /*,index,arr*/) {
                                            if (result.hid === host.id) {
                                                result._doc.port = host.port;
                                            }
                                        });
                                    }
                                }

                                if (!result) {
                                    _context8.next = 10;
                                    break;
                                }

                                return _context8.abrupt('return', ctx.body = { msg: '查询事件', data: result });

                            case 10:
                                return _context8.abrupt('return', ctx.error = { msg: '没有找到事件!' });

                            case 11:
                            case 'end':
                                return _context8.stop();
                        }
                    }
                }, _callee8, this);
            }));

            function find_one(_x8) {
                return _ref8.apply(this, arguments);
            }

            return find_one;
        }()
    }]);

    return EventController;
}();

exports.default = EventController;
//# sourceMappingURL=eventController.js.map