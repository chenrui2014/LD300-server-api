/**
 * Created by chen on 17-8-23.
 */
const {Parser}=require('../log/log');
const logger={};
Parser(logger,'EventVideoController.js');
import EventVideoService from '../services/eventVideoService';
import HostsService from '../services/hostService';
//const uuidv1=require('uuid/v1');

class EventVideoController {
    static async add_eventVideo(ctx){
        const data = ctx.request.body;
        logger.info(data);

        if(!data) return ctx.error={ msg: '发送数据失败!' };
        const isExist = await EventVideoService.isExist({typeCode:data.typeCode});
        //const isExist = await EventVideoModel.findOne({ip:data.ip});

        if(isExist) return ctx.error={ msg: '类型编码为[' + data.typeCode + ']的事件已存在!' };

        const result = await EventVideoService.add_eventVideo(data);

        let msg = '';
        if(result) {
            msg = '添加事件'+ data.typeCode +'成功';
            return ctx.body = {msg:msg,data:data};
        }else{
            msg = '添加失败';
            return ctx.error={msg: msg};
        }

    }

    static async delete_eventVideo(ctx) {
        const { id } = ctx.params;
        const result = await EventVideoService.delete_eventVideo({id:id});
        let msg = '';
        if(result) {
            msg = '删除事件成功';
            return ctx.body = {msg:msg,data:result};
        }else{
            msg = '删除事件失败';
            return ctx.error={msg: msg};
        }

    }

    static async edit_eventVideo(ctx){
        const data = ctx.request.body;
        logger.info(data);
        let _id = data._id;
        delete data._id;
        const result = await EventVideoService.edit_eventVideo({_id:_id},data);
        if(result) return ctx.body = {msg:'修改事件成功',data:result};
        return ctx.error={msg: '修改事件失败!'};
    }

    static async find_eventVideo(ctx){
        const { sort,range,filter } = ctx.query;
        let sortObj = null;
        if(sort){
            sortObj = JSON.parse(sort);
        }

        let rangeObj = null;
        if(range){
            rangeObj = JSON.parse(range);
        }

        let filterObj = null;
        if(filter && "{}" !==filter){
            let obj = JSON.parse(filter);
            if(obj && Array.isArray(obj.id)){
                filterObj = {id:{$in:obj.id}};
            }else{
                filterObj = obj;
            }
        }
        let sortP = {};
        if(sortObj && sortObj.length >=2){
            if('ASC' ===sortObj[1]){
                sortP[sortObj[0]] = 1
            }else{
                sortP[sortObj[0]] = -1
            }
        }

        let pageStart = 0,pageEnd = 0;
        if(rangeObj && rangeObj.length >=2){
            pageStart = rangeObj[0];
            pageEnd = rangeObj[1];
        }

        const total = await EventVideoService.getTotal();

        const pagination = {};
        pagination.pageStart = pageStart;
        pagination.pageSize = pageEnd-pageStart+1;
        let result = null;
        if(sortP){
            if(rangeObj){
                let pageStart = 0,pageEnd = 0;
                if(rangeObj && rangeObj.length >=2){
                    pageStart = rangeObj[0];
                    pageEnd = rangeObj[1];
                }
                const pagination = {};
                pagination.pageStart = pageStart;
                pagination.pageSize = pageEnd-pageStart+25;
                result = await EventVideoService.find_eventVideo(filterObj,sortP,pagination);
            }else{
                result = await EventVideoService.find_eventVideo(filterObj,sortP);
            }
        }else{
            if(rangeObj){
                let pageStart = 0,pageEnd = 0;
                if(rangeObj && rangeObj.length >=2){
                    pageStart = rangeObj[0];
                    pageEnd = rangeObj[1];
                }
                const pagination = {};
                pagination.pageStart = pageStart;
                pagination.pageSize = pageEnd-pageStart+25;
                result = await EventVideoService.find_eventVideo(filterObj,null,pagination);
            }else{
                result = await EventVideoService.find_eventVideo(filterObj);
            }
        }

        const hosts = await HostsService.findAll({port:1});
        //const cameras = await CamerasService.findAll({id:1});
        if(result && result.length > 0){
            result.map((item/*,i*/) =>{

                if(hosts && hosts.length > 0){
                    hosts.forEach(function (host/*,index,arr*/) {
                        if(item.hid === host.id){
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
        // let result = await EventVideoService.find_eventVideo(filterObj,sortP,pagination);
        if(result) return ctx.body = {msg:'查询事件',data:result,total:total};
        return ctx.error={msg: '没有找到事件!'};
    }

    static async find_eventVideo_noPage(ctx){
        const { sort} = ctx.query;
        let sortObj = JSON.parse(sort);
        let sortP = {};
        if(sortObj && sortObj.length >=2){
            if('ASC' ===sortObj[1]){
                sortP[sortObj[0]] = 1;
            }else{
                sortP[sortObj[0]] = -1;
            }
        }
        let result = await EventVideoService.find_eventVideo(null,sortP,null);

        const hosts = await HostsService.findAll({port:1});
        //const cameras = await CamerasService.findAll({id:1});
        if(result && result.length > 0){
            result.map((item/*,i*/) =>{

                if(hosts && hosts.length > 0){
                hosts.forEach(function (host/*,index,arr*/) {
                    if(item.hid === host.id){
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

        if(result) return ctx.body = {msg:'查询事件',data:result};
        return ctx.error={msg: '没有找到事件!'};
    }

    static async find_one(ctx){
        const { id } = ctx.params;
        const result = await EventVideoService.find_one(id);

        const hosts = await HostsService.findAll({port:1});
        if(result ){
            if(hosts && hosts.length > 0){
                hosts.forEach(function (host/*,index,arr*/) {
                    if(result.hid === host.id){
                        result._doc.port = host.port;
                    }
                });
            }
        }

        if(result) return ctx.body = {msg:'查询事件',data:result};
        return ctx.error = {msg: '没有找到事件!'};
    }

}

export default EventVideoController;