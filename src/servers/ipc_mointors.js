/**
 * Created by Luky on 2017/9/21.
 */
const Data=require('./data_server');
const _=require('lodash');

class IPCMointor{
    constructor(hid){
        this._hid=hid;
    }
    get hostID(){
        return this._hid;
    }
    set hostID(val){
        this._hid=val;
    }
    //{100:{range,points,demo,id},...}
 /*   _setMointor(mointors){
        this._mointors={};
        let ms=_.groupBy(mointors,'id');
        _.each(ms,(ipc,id)=>{
            let sorted=_.orderBy(ipc,'distance');
            this._mointors[id]={
                range:[_.first(sorted).distance,_.last(sorted).distance],
                points:sorted,
                demo:sorted[0].demo,
                id:id-0
            };
        });
    }*/

    //一个摄像头位置一个对象，其中range在球机中代表一个点，在枪机中代表一个一段距离的开始点
    async getMointors(distance){
        let ipcs=await Data.getMointors(this._hid,distance);
        let ret=[];
        _.each(ipcs.monitors,(ipc)=>{
            let isDemo=!!ipc.demo;
            if(isDemo)
            {
                let index=_.findIndex(_.sortBy(ipc.presets,'distance'),(rangei)=>{
                    return rangei.distance>=distance;
                });
                if(-1===index){
                    ret.push({
                        id:ipc.id,
                        alarm:ipc.alarm,
                        talk:ipc.audio,
                        screenshot:ipc.screenshot,
                        preset:null,x:0,y:0,z:0,
                        demo:true
                    });
                }
                else{
                    let cams=[null,ipc.presets[index]/*,null*/];
                    if(index>0) cams[0]=ipc.presets[index-1];
                    //if(index+1<mi.range.length)cams[2]=mi.range[index+1];
                    ret.push(_.extend({
                        id:ipc.id,
                        alarm:ipc.alarm,
                        talk:ipc.audio,
                        screenshot:ipc.screenshot,
                        demo:true},calcXYZ(cams,distance)));
                }
            }
            else{
                ret.push({
                    id:ipc.id,
                    alarm:ipc.alarm,
                    talk:ipc.audio,
                    screenshot:ipc.screenshot,
                    preset:null,x:0,y:0,z:0,
                    demo:false
                });
            }
        });
        return ret;
    }
}


//插值计算偏移
function interpolate(distance1,xx1,point2,xx2,distance) {
    return Math.floor(xx1+(xx2-xx1)*(distance-distance1)/(point2-distance1));
}

function calcXYZ(cams,distance){
    //距离小于1米也不需要处理
    let x1=cams[1].x;
    let y1=cams[1].y;
    let z1=cams[1].z;
    if((/*null===cams[2]&&*/null===cams[0])||Math.abs(cams[1].distance-distance)<=1){
        return {
            x:x1,
            y:y1,
            z:z1,
            preset:null,//cams[1].preset.preset,暂时不设置预置点，简单点
        };
    }
    /*    let distance1=-1,distance2=-1;
        if(cams[0]){
            distance1=position-cams[0].range[0];
        }
        if(cams[2]){
            distance2=cams[2].range[0]-position;
        }*/
    let other=cams[0];
    /*    if(distance1===-1||(distance2!==-1&&distance2<=distance1)){
            other=cams[2];
        }*/
    return {
        x:interpolate(other.distance,other.x,cams[1].distance,x1,distance),
        y:interpolate(other.distance,other.y,cams[1].distance,y1,distance),
        z:interpolate(other.distance,other.z,cams[1].distance,z1,distance),
        preset:null
    };
}


exports=module.exports=IPCMointor;