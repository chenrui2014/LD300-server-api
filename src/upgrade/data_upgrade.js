/**
 * Created by Luky on 2017/10/22.
 */
const config=global.server_config||require('../config/config');
const systemConfig=config.getData('system_config.json');
const userConfig=config.getData('user_config.json');
const _=require('lodash');
const path=require('path');
const fs = require('fs');
const assert=require('assert');

function _upgradeHostData(){
    let data=[];
    _.each(_.get(systemConfig,'serialport',[]),(port,index)=>{
        data.push({id:index,port:`\\\\.\\COM${port}`})
    });
    return data;
}

function _upgradeCameraAndMointorData(){
    let cames=[];//[{id,user,functons...}]
    let mointors=[];//[{hostid,mointors}]
    let lines=userConfig['lines']||[];
    let getCame=(came)=>{
        return _.find(cames,(c)=>{return c.ip===came.ip;})
    };
    let addCame=(came)=>{
        let c=getCame(came);
        if(c){
            c.functions.alarm=c.functions.alarm||came.alarm;
            c.functions.ptz=c.functions.ptz||came['isDome'];
            c.functions.audio=c.functions.audio||came.talk;
            return c;
        }
        let data={
            id:cames.length,
            ip:came.ip,
            port:came.port,
            user:came.user,
            pwd:came.pwd,
            brand:came.cid===0?'dahua':'hopewell',
            functions:{
                ptz:came['isDome']||false,
                alarm:came.alarm||false,
                audio:came.talk||false
            }
        };
        if(data.brand!=='dahua'){
            data.onvif={
                port:80,
                user:'admin',
                pwd:'admin',
                path:''
            }
        }
        cames.push(data);
        return data;
    };
    let addMointor=(mointor,c,distance,came)=>{
        let d={
            id:c.id,
            demo:c.functions.ptz,
            alarm:came.alarm||false,
            screenshot:came.screenshot||false,
            audio:came.talk||false,
            distance:distance
        };
        if(d.demo){
            d.preset={x:came.x||0,y:came.y||0,z:came.z||0,preset:''}
        }
        mointor.push(d);
    };
    _.each(lines,(line,index)=>{
        let cz=line['alarm_channel'];
        if(cz!==-1){
            mointors.push({id:index,mointors:_.cloneDeep(mointors[cz].mointors)});
            return;
        }
        let points=line['cam_points']||[];
        let mointor=[];
        mointors.push({id:index,mointors:mointor});
        _.each(points,(point)=>{
            let came=point['primary'];
            let distance=point['distance'];
            if(came.ip)addMointor(mointor,addCame(came),distance,came);
            came=point['secondary'];
            if(came.ip)addMointor(mointor,addCame(came),distance,came);
        });
    });
    return [cames,mointors];
}

/*先用两点间距离公式求出各边长，角A对应的边长为a，角B对应的边长为b，角C对应的边长为c。
再由余弦公式求得：
cosA=(b*b+c*c-a*a)/2bc
同理可求出cosB，cosC
再用计算器算出arccosA，arccosB和arccosC即得*/

function angle(pointCalc,point1,point2) {
    let aa=(point1.x-point2.x)*(point1.x-point2.x)+(point1.y-point2.y)*(point1.y-point2.y);
    let bb=(point1.x-pointCalc.x)*(point1.x-pointCalc.x)+(point1.y-pointCalc.y)*+(point1.y-pointCalc.y);
    let cc=(point2.x-pointCalc.x)*(point2.x-pointCalc.x)+(point2.y-pointCalc.y)*+(point2.y-pointCalc.y);
    let cosA=(bb+cc-aa)/(2*Math.sqrt(bb*cc));
    return Math.acos(cosA)*180/Math.PI;
}

//计算折返点
function Zf(index) {
    let lines=userConfig['lines']||[];
    let line=lines[index];
    let points=line['cali_points'];
    points=_.sortBy(points,'distance');
    if(!points.length) return [];
    let pointA={x:points[0].point[0],y:points[0].point[1]};
    let ret=[];
    for(let i=1;i<points.length-1;i++){
        let pointB={x:points[i].point[0],y:points[i].point[1]};
        let pointC={x:points[i+1].point[0],y:points[i+1].point[1]};
        let a=angle(pointB,pointA,pointC);
        if(a<10) ret.push(points[i]['distance']);
        pointA=pointB;
    }
    return ret;
}

function upgradeMointorData2(mointors){
    let ret=[];
    _.each(mointors,(mo,index)=>{
        let ms=_.cloneDeep(mo.mointors);
        let zf=(Zf(index)||[99999999]).concat([9999999]);
        let ms2=[];
        let fromIndex=[0];
        //console.log(`zfd${JSON.stringify(zf)}`);
        let findIPC=(ipc,z)=>{
            return _.find(ms2,(i)=>{return i.id===ipc.id;},fromIndex[z]);
        };
        ms=_.sortBy(ms,'distance');
        let z=0;
        _.each(ms,(i)=>{

            if(i.distance>zf[z]){
                //ipcs.length-1时拐点处的摄像头连续
                fromIndex.push(ms2.length-1);z++;
            }
            let ipc=findIPC(i,z);
            if(!ipc){
                let i2=_.cloneDeep(i);
                delete i2.distance;
                delete i2.preset;
                i2.max=i2.min=i.distance;
                i2.presets=[];
                if(i.demo){
                    let preset=_.cloneDeep(i.preset);
                    preset.distance=i.distance;
                    i2.presets.push();
                }
                ms2.push(i2);
            }
            else{
                ipc.min=Math.min(ipc.min,i.distance);
                ipc.max=Math.max(ipc.max,i.distance);
                if(i.demo){
                    let preset=_.cloneDeep(i.preset);
                    preset.distance=i.distance;
                    ipc.presets.push(preset);
                }
            }
        });
        ret.push({id:mo.id,mointors:ms2});
    });
    return ret;
}

function _partition(mointors,ipcData) {
    let r=[];
    let getData=(id)=>{
        return _.find(ipcData,(data)=>{return data.id===id;})
    };
    _.each(mointors,(m,xh)=>{
        if(!m.mointors.length) return;
        let ipcs=[];
        let partition=[];
        let zf=(Zf(xh)||[99999999]).concat([9999999]);
        let fromIndex=[0];
        //console.log(`zfd${JSON.stringify(zf)}`);
        let findIPC=(ipc,z)=>{
            return _.find(ipcs,(i)=>{return i.id===ipc.id;},fromIndex[z]);
        };
        let index=1;
        m.mointors=_.sortBy(m.mointors,'point');
        let z=0;
        _.each(m.mointors,(i)=>{
            if(i.distance>zf[z]){
                //ipcs.length-1时拐点处的摄像头连续
                fromIndex.push(ipcs.length-1);z++;
            }
            let ipc=findIPC(i,z);
            if(!ipc){
                ipcs.push({id:i.id,min:i.distance,max:i.distance,demo:getData(i.id).functions.ptz});
            }
            else{
                ipc.min=Math.min(ipc.min,i.distance);
                ipc.max=Math.max(ipc.max,i.distance);
            }
        });
        let ipcsSorted= _.sortBy(ipcs,['min','max']);
        /*        for(let i=0;i<ipcsSorted.length;i++){
                    let ipci=ipcsSorted[i];
                    console.log(`demo:${getData(ipci.id).functions.ptz},id:${ipci.id},[${ipci.min},${ipci.max}]`);
                }*/
        let [demo,undemo]=_.partition(ipcsSorted,(ipc)=>{return ipc.demo});
        //两种情况 狗牙式、包含方式、可能存在不叠加不覆盖的情况,也没关系
        //处理枪机
        undemo.push({id:9999999,min:999999,max:999999});
        for(let i=0;i<undemo.length-1;i++){
            let ipc1=undemo[i];
            let ipc2=undemo[i+1];
            if(ipc2.min>ipc1.max){
                partition.push({ipcs:[ipc1.id],min:ipc1.min,max:ipc1.max});
            }
            else if(ipc2.min===ipc1.max){
                partition.push({ipcs:[ipc1.id],min:ipc1.min,max:ipc1.max});
                ipc2.min++;
            }
            else if(ipc2.min>ipc1.min){//ipc1有独立的位置
                partition.push({ipcs:[ipc1.id],min:ipc1.min,max:ipc2.min-1});
                ipc1.min=ipc2.min=ipc2.min-1;
                i--;
            }
            else{//ipc2.min==ipc1.min
                let max=Math.min(ipc1.max,ipc2.max);
                partition.push({ipcs:[
                    ipc1.id,ipc2.id
                ],min:ipc2.min,max:max});
                if(ipc2.min===ipc2.max) i++;
                else ipc2.min=ipc1.min=ipc1.max+1;
            }
        }
        //插入球机
        _.each(demo,(ipc)=>{
            for(let i=0;i<partition.length;i++){
                let pi=partition[i];
                if(ipc.max<=pi.min){
                    break;
                }
                if(ipc.min<pi.max){
                    if(ipc.max>=pi.max){
                        pi.ipcs.push(ipc.id);
                    }
                    else{
                        partition.splice(i,0,_.cloneDeep(pi));
                        pi.min=ipc.max+1;
                        partition[i].max=ipc.max;
                        partition[i].ipcs.push(ipc.id);
                        break;
                    }
                }
            }
        });

        //分组存储
        r[xh]=_.groupBy(partition,(item)=>{
            let ipcs=item.ipcs;
            delete item.ipcs;
            return _.sortBy(ipcs).join(',');
        });

        //打印分区区域距离
        /*        _.each(partition,(p)=>{
                    let result=[];
                    _.each(p.ipcs,(p)=>{
                       result.push(p.id);
                    });
                    console.log(`[${result.join(',')}],[${p.min},${p.max}]`);
                });*/
    });
    //打印摄像头的分组情况
    /*    _.each(r,(ri)=>{
            console.log(_.keys(ri).sort((a,b)=>{
                let ar=a.split(','),br=b.split(',');

                let i=0,mi=Math.min(ar.length,br.length);
                while(i<mi){
                    if(ar[i]===br[i]){i++;continue;}
                    return ar[i]-br[i];
                }
                return ar.length-br.length;
            }).join('|'));
        });*/
    return r;
}

const wOption = {
    flags: 'w',
    encoding: null,
    fd: null,
    mode: 0o666,
    autoClose: true
};

function upgrade(){
    let hosts=_upgradeHostData();
    let [cames,mointors]=_upgradeCameraAndMointorData();
    let hostFile=config.getDataDir('hosts_config.json');
    let camesFile=config.getDataDir('ipcs_config.json');
    let mFile=config.getDataDir('mointors_config.json');
    let fh=fs.createWriteStream(hostFile,wOption);
    fh.write(JSON.stringify(hosts));
    fh.close();
    let fi=fs.createWriteStream(camesFile,wOption);
    fi.write(JSON.stringify(cames));
    fi.close();
    let fm=fs.createWriteStream(mFile,wOption);
    fm.write(JSON.stringify(upgradeMointorData2(mointors)));
    fm.close();

    let p=_partition(mointors,cames);
    let allGroup=[];
    _.each(p,(pi)=> {
        allGroup=_.union(allGroup,_.keys(pi));
    });

    allGroup.sort((a,b)=>{
        let ar=a.split(','),br=b.split(',');

        let i=0,mi=Math.min(ar.length,br.length);
        while(i<mi){
            if(ar[i]===br[i]){i++;continue;}
            return ar[i]-br[i];
        }
        return ar.length-br.length;
    });

    let getIPC=(ipcID)=>{
        return _.find(cames,(i)=>{return i.id===ipcID;});
    };

    let fq=[];

    let partitionJson=config.getDataDir('partition_ipc_config.json');
    let partitionHostJson=config.getDataDir('partition_host_config.json');
    let partitionTxt=config.getDataDir('partition.txt');
    let fj=fs.createWriteStream(partitionJson,wOption);
    let ft=fs.createWriteStream(partitionTxt,wOption);
    let fhj=fs.createWriteStream(partitionHostJson,wOption);
    fh.write(JSON.stringify(hosts));

    _.each(allGroup,(group,index)=>{
        ft.write(`分区${index}\r\n`);
        _.each(group.split(','),(ipcID)=>{
            ft.write(`摄像头ip${getIPC(ipcID-0).ip}\r\n`);
        });
        ft.write(`----------分割线------------\r\n\r\n`);
        fq.push({index,ipcs:group});
    });
    fj.write(JSON.stringify(fq));
    fh.close();
    fj.close();
    let getFqIndex=(name)=>{
        return _.find(fq,(fqi)=>{return fqi.ipcs===name;}).index;
    };

    let m2=[];
    _.each(p,(pi,hostID)=>{
        let hostRange=[];
        _.each(pi,(ranges,ipcs)=>{
            let fqIndex=getFqIndex(ipcs);
            _.each(ranges,(range)=>{
                hostRange.push({distance:range.max,index:fqIndex});
            });
        });
        hostRange=_.sortBy(hostRange,'distance');
        m2.push({id:hostID,partition:hostRange});
    });
    fhj.write(JSON.stringify(m2));
    fhj.close();
}

exports=module.exports={
    upgrade:upgrade
};