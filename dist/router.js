'use strict';

var _cameraController = require('./controllers/cameraController');

var _cameraController2 = _interopRequireDefault(_cameraController);

var _camerasController = require('./controllers/camerasController');

var _camerasController2 = _interopRequireDefault(_camerasController);

var _hostController = require('./controllers/hostController');

var _hostController2 = _interopRequireDefault(_hostController);

var _monitoringAreaController = require('./controllers/monitoringAreaController');

var _monitoringAreaController2 = _interopRequireDefault(_monitoringAreaController);

var _perimeterPointController = require('./controllers/perimeterPointController');

var _perimeterPointController2 = _interopRequireDefault(_perimeterPointController);

var _eventController = require('./controllers/eventController');

var _eventController2 = _interopRequireDefault(_eventController);

var _userController = require('./controllers/userController');

var _userController2 = _interopRequireDefault(_userController);

var _presetController = require('./controllers/presetController');

var _presetController2 = _interopRequireDefault(_presetController);

var _cameraTypeController = require('./controllers/cameraTypeController');

var _cameraTypeController2 = _interopRequireDefault(_cameraTypeController);

var _configController = require('./controllers/configController');

var _configController2 = _interopRequireDefault(_configController);

var _vendorController = require('./controllers/vendorController');

var _vendorController2 = _interopRequireDefault(_vendorController);

var _unitController = require('./controllers/unitController');

var _unitController2 = _interopRequireDefault(_unitController);

var _ppController = require('./controllers/ppController');

var _ppController2 = _interopRequireDefault(_ppController);

var _eventVideoController = require('./controllers/eventVideoController');

var _eventVideoController2 = _interopRequireDefault(_eventVideoController);

var _koaRouter = require('koa-router');

var _koaRouter2 = _interopRequireDefault(_koaRouter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = new _koaRouter2.default();
//import { isBearerAuthenticated, isLocalAuthenticated } from './lib/auth';

//import PerimeterController from './controllers/perimeterController';
/**
 * Created by chen on 17-8-22.
 */

router.prefix('/api');

// // 初始化用户数据
// UserController.seed();
//
// router.use(async (ctx, next) => {
//     try {
//         await next()
//     } catch (error) {
//         console.error(error)
//         ctx.status = ctx.status || 400
//         ctx.body = {
//             code: error.code,
//             message: error.message || error.errmsg || error.msg || 'unknown_error',
//             error
//         }
//     }
// })


// // Auth
// router.post('/auth', isLocalAuthenticated(), UserController.signToken)
// router.get('/auth', isBearerAuthenticated(), UserController.getUserByToken)
// module.exports.initialize = function () {
//     router.get('/', async (ctx, next) => {
//         await ctx.render('index.pug');
//     });
// };
//摄像头路由
router.get('/camera', _cameraController2.default.find_camera).get('/camera_noPage', _cameraController2.default.find_camera_noPage).get('/camera/:id', _cameraController2.default.find_one).post('/camera', _cameraController2.default.add_camera).put('/camera/:id', _cameraController2.default.edit_camera).delete('/camera/:id', _cameraController2.default.delete_camera);

//摄像头路由
router.get('/cameras', _camerasController2.default.find_cameras).get('/cameras_noPage', _camerasController2.default.find_cameras_noPage).get('/cameras/:id', _camerasController2.default.find_one).post('/cameras', _camerasController2.default.add_cameras).put('/cameras/:id', _camerasController2.default.edit_cameras).delete('/cameras/:id', _camerasController2.default.delete_cameras);

//主机路由
router.get('/hosts', _hostController2.default.find_host).get('/ports', _hostController2.default.getPort).get('/hosts_noPage', _hostController2.default.find_host_noPage).get('/hosts/:id', _hostController2.default.find_one).post('/hosts', _hostController2.default.add_host).put('/hosts/:id', _hostController2.default.edit_host).delete('/hosts/:id', _hostController2.default.delete_host);

//监控区域路由
router.get('/monitoringArea', _monitoringAreaController2.default.find_monitoringArea).get('/monitoringArea_noPage', _monitoringAreaController2.default.find_monitoringArea_noPage).get('/monitoringArea/:id', _monitoringAreaController2.default.find_one).post('/monitoringArea', _monitoringAreaController2.default.add_monitoringArea).put('/monitoringArea/:id', _monitoringAreaController2.default.edit_monitoringArea).delete('/monitoringArea/:id', _monitoringAreaController2.default.delete_monitoringArea);

//周界路由
router.get('/pp', _ppController2.default.find_pp).get('/pp_noPage', _ppController2.default.find_pp_noPage).get('/pp/:id', _ppController2.default.find_one).post('/pp', _ppController2.default.add_pp).put('/pp/:id', _ppController2.default.edit_pp).delete('/pp/:id', _ppController2.default.delete_pp);

//周界路由
router.get('/perimeter', _ppController2.default.find_pp).get('/perimeter/:id', _ppController2.default.find_one).post('/perimeter', _ppController2.default.add_pp).put('/perimeter/:id', _ppController2.default.edit_pp).delete('/perimeter/:id', _ppController2.default.delete_pp);

//周界点路由
router.get('/perimeterPoint', _perimeterPointController2.default.find_perimeterPoint).get('/perimeterPoint/:id', _perimeterPointController2.default.find_one).post('/perimeterPoint', _perimeterPointController2.default.add_perimeterPoint).put('/perimeterPoint/:id', _perimeterPointController2.default.edit_perimeterPoint).delete('/perimeterPoint/:id', _perimeterPointController2.default.delete_perimeterPoint);

//预置点路由
router.get('/preset', _presetController2.default.find_preset).get('/preset/:id', _presetController2.default.find_one).post('/preset', _presetController2.default.add_preset).put('/preset/:id', _presetController2.default.edit_preset).delete('/preset/:id', _presetController2.default.delete_preset);

//事件路由
router.get('/event', _eventController2.default.find_event).get('/event/:id', _eventController2.default.find_one).post('/event', _eventController2.default.add_event).put('/event/:id', _eventController2.default.edit_event).delete('/event/:id', _eventController2.default.delete_event);
//事件录像路由
router.get('/eventVideo', _eventVideoController2.default.find_eventVideo).get('/eventVideo/:id', _eventVideoController2.default.find_one).post('/eventVideo', _eventVideoController2.default.add_eventVideo).put('/eventVideo/:id', _eventVideoController2.default.edit_eventVideo).delete('/eventVideo/:id', _eventVideoController2.default.delete_eventVideo);
//摄像头类型路由
router.get('/cameraType', _cameraTypeController2.default.find_cameraType).get('/cameraType_noPage', _cameraTypeController2.default.find_cameraType_noPage).get('/cameraType/:id', _cameraTypeController2.default.find_one).post('/cameraType', _cameraTypeController2.default.add_cameraType).put('/cameraType/:id', _cameraTypeController2.default.edit_cameraType).delete('/cameraType/:id', _cameraTypeController2.default.delete_cameraType);

//单位路由
router.get('/unit', _unitController2.default.find_unit).get('/unit/:id', _unitController2.default.find_one).post('/unit', _unitController2.default.add_unit).put('/unit/:id', _unitController2.default.edit_unit).delete('/unit/:id', _unitController2.default.delete_unit);

//系统配置路由
router.get('/config', _configController2.default.find_config).get('/config_noPage', _configController2.default.find_config_noPage).get('/config/:id', _configController2.default.find_one).post('/config', _configController2.default.add_config).put('/config/:id', _configController2.default.edit_config).delete('/config/:id', _configController2.default.delete_config);

//厂商路由
router.get('/vendor', _vendorController2.default.find_vendor).get('/vendor/:id', _vendorController2.default.find_one).post('/vendor', _vendorController2.default.add_vendor).put('/vendor/:id', _vendorController2.default.edit_vendor).delete('/vendor/:id', _vendorController2.default.delete_vendor);

//用户路由
router.post('/user', _userController2.default.create_user).post('/login', _userController2.default.signIn);

module.exports = router;
//# sourceMappingURL=router.js.map