/**
 * Created by chen on 17-8-23.
 */
import logger from '../logger';
import PerimeterPointService from "../services/perimeterPointService";
import PerimeterService from '../services/perimeterService';
import HostService from '../services/hostService';

class PerimeterPointController {
    static async add_perimeterPoint(ctx){
        const data = ctx.request.body;
        logger.info(data);
        if(!data) return ctx.error={ msg: '发送数据失败!' };
        // const isExit = await PerimeterPointService.isExist({realPosition:data.realPosition});
        // logger.info(isExit);
        // if(isExit) return ctx.error={ msg: '该实际距离的周界点已存在!' };

        let perimeter = {name:data.name,status:1};
        let perimeterId = await PerimeterService.add_perimeter(perimeter)
        if(perimeterId != null){
            return ctx.error={ msg: '添加周界失败!' };
        }
        let pps = [];
        for(let i = 0,len=data.pp.length; i < len; i++) {
            let perimeterPoint = {};
            perimeterPoint.name = data.name;
            perimeterPoint.x = data.pp[i].x;
            perimeterPoint.y = data.pp[i].y;
            perimeterPoint.No = data.pp[i].No;
            perimeterPoint.mapPosition = data.pp[i].mapPosition;
            perimeterPoint.realPosition = data.pp[i].realPosition;
            perimeterPoint.perimeterId = perimeterId;

            pps.push(perimeterPoint);
        }

        const result = PerimeterPointService.add_list(pps);
        let msg = '';
        if(result) {
            msg = '添加周界'+data.name+'成功';
            return ctx.body = {msg:msg,data:data};
        }else{
            msg = '添加失败';
            return ctx.error={msg: msg};
        }


    }

    static async delete_perimeterPoint(ctx) {
        const { id } = ctx.params;
        logger.info(id);
        const result = await PerimeterPointService.delete_perimeterPoint({id:id});
        let msg = '';
        if(result) {
            msg = '删除周界点成功';
            return ctx.body = {msg:msg,data:result};
        }else{
            msg = '删除周界点失败';
            return ctx.error={msg: msg};
        }


    }

    static async edit_perimeterPoint(ctx){
        const data = ctx.request.body;
        logger.info(data);
        let _id = data._id;
        delete data._id;
        const result = await PerimeterPointService.edit_perimeterPoint({_id:_id},data);
        if(result) ctx.body = {msg:'修改周界点成功',data:result};
        return ctx.error={msg: '修改周界点失败!'};
    }

    static async find_perimeterPoint(ctx){
        const { sort,range,filter } = ctx.query;
        let sortObj = JSON.parse(sort);
        let sortP = {};
        if(sortObj && sortObj.length >=2){
            if('ASC' ===sortObj[1]){
                sortP[sortObj[0]] = 1
            }else{
                sortP[sortObj[0]] = -1
            }
        }

        const total = await PerimeterPointService.getTotal();

        const result = await PerimeterPointService.findAll(sortP);
        const hosts = await HostService.findAll();

        result.forEach(function (e) {
            hosts.forEach(function (host) {
                if(e._doc.perimeterId === host._doc.id) e._doc.host = host._doc;
                return;
            });
        });
        //const result = await PerimeterPointModel.find().exec();
        if(result) return ctx.body = {msg:'查询周界点成功',data:result,total:total};
        return ctx.error={msg: '没有找到周界点!'};
    }
    static async find_one(ctx){
        const { id } = ctx.params;
        const result = await PerimeterPointService.find_one(id);
        const hosts = await HostService.findAll();

        result.forEach(function (e) {
            hosts.forEach(function (host) {
                if(e._doc.perimeterId === host._doc.id) e._doc.host = host._doc;
                return;
            });
        });
        if(result) ctx.body = {msg:'查询周界点',data:result};
        return ctx.error = {msg: '没有找到周界点!'};
    }

}

export default PerimeterPointController;