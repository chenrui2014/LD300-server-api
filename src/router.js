/**
 * Created by chen on 17-8-22.
 */

import CaremaController from './controllers/cameraController';
import HostController from './controllers/hostController';
import MonitoringAreaController from './controllers/monitoringAreaController';
import PerimeterController from './controllers/perimeterController';
import PerimeterPointController from './controllers/perimeterPointController';
import EventController from './controllers/eventController';
import UserController from './controllers/userController';
import PresetController from './controllers/PresetController';

import Router from 'koa-router';

const router = new Router();
router.prefix('/api');
// module.exports.initialize = function () {
//     router.get('/', async (ctx, next) => {
//         await ctx.render('index.pug');
//     });
// };
//摄像头路由
router.get('/cameras',CaremaController.find_camera)
    .get('/cameras_noPage',CaremaController.find_camera_noPage)
    .get('/cameras/:id',CaremaController.find_one)
    .post('/cameras',CaremaController.add_camera)
    .put('/cameras/:id',CaremaController.edit_camera)
    .delete('/cameras/:id',CaremaController.delete_camera);

//主机路由
router.get('/hosts', HostController.find_host)
    .get('/hosts_noPage',HostController.find_host_noPage)
    .get('/hosts/:id',HostController.find_one)
    .post('/hosts',HostController.add_host)
    .put('./hosts/:id',HostController.edit_host)
    .delete('/hosts/:id',HostController.delete_host);

//监控区域路由
router.get('/monitoringArea', MonitoringAreaController.find_monitoringArea)
    .get('/monitoringArea/:id',MonitoringAreaController.find_one)
    .post('/monitoringArea',MonitoringAreaController.add_monitoringArea)
    .put('./monitoringArea/:id',MonitoringAreaController.edit_monitoringArea)
    .delete('/monitoringArea/:id',MonitoringAreaController.delete_monitoringArea);

//周界路由
router.get('/perimeter', PerimeterController.find_perimeter)
    .get('/perimeter/:id',PerimeterController.find_one)
    .post('/perimeter',PerimeterController.add_perimeter)
    .put('./perimeter/:id',PerimeterController.edit_perimeter)
    .delete('/perimeter/:id',PerimeterController.delete_perimeter);

//周界点路由
router.get('/perimeterPoint', PerimeterPointController.find_perimeterPoint)
    .get('/perimeterPoint/:id',PerimeterPointController.find_one)
    .post('/perimeterPoint',PerimeterPointController.add_perimeterPoint)
    .put('./perimeterPoint/:id',PerimeterPointController.edit_perimeterPoint)
    .delete('/perimeterPoint/:id',PerimeterPointController.delete_perimeterPoint);

//预置点路由
router.get('/preset', PresetController.find_preset)
    .get('/preset/:id',PresetController.find_one)
    .post('/preset',PresetController.add_preset)
    .put('./preset/:id',PresetController.edit_preset)
    .delete('/preset/:id',PresetController.delete_preset);

//事件路由
router.get('/event', EventController.find_event)
    .get('/event/:id',EventController.find_one)
    .post('/event',EventController.add_event)
    .put('./event/:id',EventController.edit_event)
    .delete('/event/:id',EventController.delete_event);

//用户路由
router.post('/user',UserController.create_user)
    .post('/login', UserController.signIn);

module.exports = router;