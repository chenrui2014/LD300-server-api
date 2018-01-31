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
let logger={};
Parser(logger,'index.js',{store,type});
(async ()=>{
    try {
        if(store==='db') {
            const connection = await connect();
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