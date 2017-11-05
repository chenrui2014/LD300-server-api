/**
 * Created by Luky on 2017/7/7.
 */


class Vedio{
    get config(){throw new Error('未实现函数config');};
    get isConnected(){throw new Error('未实现函数isConnect');}
    connect(){throw new Error('未实现函数connect');}
    disConnect(){throw new Error('未实现函数DisConnect');}
    //全部从辅码1流中获取，如果需要高精度请对应设置设备参数
    realPlay() {throw new Error('未实现函数realPlay');}
    stopRealPlay() {throw new Error('未实现函数stopRealPlay');}
}

exports=module.exports=Vedio;