/**
 * Created by Luky on 2017/10/25.
 */


const  _=require('lodash');
let interfaces=[];
interfaces.push({project:'RongFei-YiLiPrison',interface:require('./RongFei/i_rong_fei')});

function getInterface(project) {
    let i=_.find(interfaces,{project:project});
    if(!i) return null;
    return new i.interface();
}
exports=module.exports={
    getInterface
};