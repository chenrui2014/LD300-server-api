import CamerasService from "./services/camerasService";

require('./init');
const _=require('lodash');
const config=server_config||require('./config/config');
const store=_.get(config,"runMode.store","db");
const type=_.get(config,"runMode.type","BS");
const connect=require('./db');
const {Parser}=require('./log/log');
const process=require('process');
const startUp=require('./servers/startup');
const app=require('./app');
const UserService = require("./services/userService");
const admin = require("./config/admin");
const uuidv1=require('uuid/v1');
let logger={};
Parser(logger,'index.js',{store,type});
(async ()=>{
    try {
        if(store==='db') {
            const connection = await connect();
            const total = await CamerasService.getTotal();
            if(total ===0){
                await UserService.add_user({id:uuidv1(),username:admin[0].name,password:admin[0].password});
                await UserService.add_user({id:uuidv1(),username:admin[1].name,password:admin[1].password});
                await UserService.add_user({id:uuidv1(),username:admin[2].name,password:admin[2].password});
            }

            logger.log('MongoDB已连接', {host:connection.host, port:connection.port, name:connection.name});
        }
        await (new startUp()).start();
        if(type==='BS'){
            await app();
        }
    }catch (error) {
        logger.error('启动失败',{innerError:error.toString()});
        process.exit(-1);
    }
})();