//import connect from '../db';
const connect =require('../db/index');

exports=module.exports= async function(){
    await connect();
};

