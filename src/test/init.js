import connect from '../db';

exports=module.exports= async function(){
    await connect();
};

