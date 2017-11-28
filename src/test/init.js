let config=require('../config/config');
require('./modify_config');

const connect =require('../db/index');
exports=module.exports= {
    db:async function() {
        config.runMode.store = 'db';
        await connect();
    },
    file:async function(){
        config.runMode.store = 'file';
    }
};