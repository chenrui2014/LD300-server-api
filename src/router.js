/**
 * Created by chen on 17-8-22.
 */

import CaremaController from './controllers/cameraController';
import CaremasController from './controllers/camerasController';
import HostController from './controllers/hostController';
import MonitoringAreaController from './controllers/monitoringAreaController';
//import PerimeterController from './controllers/perimeterController';
import PerimeterPointController from './controllers/perimeterPointController';
import EventController from './controllers/eventController';
import UserController from './controllers/userController';
import PresetController from './controllers/presetController';
import CameraTypeController from './controllers/cameraTypeController';
import ConfigController from './controllers/configController';
import VendorController from './controllers/vendorController';
import UnitController from './controllers/unitController';
import PpController from './controllers/ppController';
import EventVideoController from './controllers/eventVideoController';
//import { isBearerAuthenticated, isLocalAuthenticated } from './lib/auth';

import Router from 'koa-router';

const router = new Router();
router.prefix('/api');

// 初始化用户数据
//UserController.seed;
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
router.get('/camera',CaremaController.find_camera)
    .get('/camera_noPage',CaremaController.find_camera_noPage)
    .get('/camera/:id',CaremaController.find_one)
    .post('/camera',CaremaController.add_camera)
    .put('/camera/:id',CaremaController.edit_camera)
    .delete('/camera/:id',CaremaController.delete_camera);

//摄像头路由
router.get('/cameras',CaremasController.find_cameras)
    .get('/cameras_noPage',CaremasController.find_cameras_noPage)
    .get('/cameras/:id',CaremasController.find_one)
    .post('/cameras',CaremasController.add_cameras)
    .put('/cameras/:id',CaremasController.edit_cameras)
    .delete('/cameras/:id',CaremasController.delete_cameras);

//主机路由
router.get('/hosts', HostController.find_host)
    .get('/ports',HostController.getPort)
    .get('/hosts_noPage',HostController.find_host_noPage)
    .get('/hosts/:id',HostController.find_one)
    .post('/hosts',HostController.add_host)
    .put('/hosts/:id',HostController.edit_host)
    .delete('/hosts/:id',HostController.delete_host);

//监控区域路由
router.get('/monitoringArea', MonitoringAreaController.find_monitoringArea)
    .get('/monitoringArea_noPage',MonitoringAreaController.find_monitoringArea_noPage)
    .get('/monitoringArea/:id',MonitoringAreaController.find_one)
    .post('/monitoringArea',MonitoringAreaController.add_monitoringArea)
    .put('/monitoringArea/:id',MonitoringAreaController.edit_monitoringArea)
    .delete('/monitoringArea/:id',MonitoringAreaController.delete_monitoringArea);

//周界路由
router.get('/pp', PpController.find_pp)
    .get('/pp_noPage',PpController.find_pp_noPage)
    .get('/pp/:id',PpController.find_one)
    .post('/pp',PpController.add_pp)
    .put('/pp/:id',PpController.edit_pp)
    .delete('/pp/:id',PpController.delete_pp);

//周界路由
router.get('/perimeter', PpController.find_pp)
    .get('/perimeter/:id',PpController.find_one)
    .post('/perimeter',PpController.add_pp)
    .put('/perimeter/:id',PpController.edit_pp)
    .delete('/perimeter/:id',PpController.delete_pp);

//周界点路由
router.get('/perimeterPoint', PerimeterPointController.find_perimeterPoint)
    .get('/perimeterPoint/:id',PerimeterPointController.find_one)
    .post('/perimeterPoint',PerimeterPointController.add_perimeterPoint)
    .put('/perimeterPoint/:id',PerimeterPointController.edit_perimeterPoint)
    .delete('/perimeterPoint/:id',PerimeterPointController.delete_perimeterPoint);

//预置点路由
router.get('/preset', PresetController.find_preset)
    .get('/preset/:id',PresetController.find_one)
    .post('/preset',PresetController.add_preset)
    .put('/preset/:id',PresetController.edit_preset)
    .delete('/preset/:id',PresetController.delete_preset);

//事件路由
router.get('/event', EventController.find_event)
    .get('/event/:id',EventController.find_one)
    .post('/event',EventController.add_event)
    .put('/event/:id',EventController.edit_event)
    .delete('/event/:id',EventController.delete_event);
//事件录像路由
router.get('/eventVideo', EventVideoController.find_eventVideo)
    .get('/eventVideo/:id',EventVideoController.find_one)
    .post('/eventVideo',EventVideoController.add_eventVideo)
    .put('/eventVideo/:id',EventVideoController.edit_eventVideo)
    .delete('/eventVideo/:id',EventVideoController.delete_eventVideo);
//摄像头类型路由
router.get('/cameraType', CameraTypeController.find_cameraType)
    .get('/cameraType_noPage',CameraTypeController.find_cameraType_noPage)
    .get('/cameraType/:id',CameraTypeController.find_one)
    .post('/cameraType',CameraTypeController.add_cameraType)
    .put('/cameraType/:id',CameraTypeController.edit_cameraType)
    .delete('/cameraType/:id',CameraTypeController.delete_cameraType);

//单位路由
router.get('/unit', UnitController.find_unit)
    .get('/unit/:id',UnitController.find_one)
    .post('/unit',UnitController.add_unit)
    .put('/unit/:id',UnitController.edit_unit)
    .delete('/unit/:id',UnitController.delete_unit);

//系统配置路由
router.get('/config', ConfigController.find_config)
    .get('/config_noPage',ConfigController.find_config_noPage)
    .get('/config/:id',ConfigController.find_one)
    .post('/config',ConfigController.add_config)
    .put('/config/:id',ConfigController.edit_config)
    .delete('/config/:id',ConfigController.delete_config);

//厂商路由
router.get('/vendor', VendorController.find_vendor)
    .get('/vendor/:id',VendorController.find_one)
    .post('/vendor',VendorController.add_vendor)
    .put('/vendor/:id',VendorController.edit_vendor)
    .delete('/vendor/:id',VendorController.delete_vendor);

//用户路由
router.post('/user',UserController.add_user)
    .post('/login', UserController.signIn)
    .post('/logout', UserController.signOut);

module.exports = router;