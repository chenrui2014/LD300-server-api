let config=require('../config/config');
require('./modify_config');

const connect =require('../db/index');
exports=module.exports= async function(){
    config.runMode.store='db';
    await connect();
};

