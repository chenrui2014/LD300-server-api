const path=require('path');

let config={
    runMode:{
        //S 仅服务端，通过socket提供接口
        //BS 服务端浏览器端模式
        type:'BS',
        project:'RongFei-YiLiPrison',
        interfaces:'RongFei/i_rong_fei.js',
        store:'db'//file数据由文件方式存储，db由数据库方式存储
    },
    web:{
        port:9000
    },
    state_server:{//状态广播服务配置
        type:'socket',//暂时不解析，socket用于作为代理模式，其他厂商提供客户端，http-socket则使用集成平台
        port:3001,//本地开放接口
        path:'/stateServer'//http-socket时有效
    },
    host:{//主机配置
        port:{
            baudRate: 115200,
            stopBits: 2,
            dataBits: 8,
            parity:"none",
            byteLength:16
        },
        systemReadySignalSendSpan: [9000,2000,2000,2000]
    },
    ipc_server:{//ip摄像头配置
        type:'client',//client为客户端直连摄像头模式，server或其他为服务端模式
        listen:false,//是否监听摄像头状态，监听则可知道摄像头是否工作正常
        port:3000//type为client有效
    },
    serialPort:{//串口配置
        //0关闭，-1无限次恢复，>0恢复次数
        tryRecover:-1,
        //应根据主机重启或异常重置的时间来设置下面参数
        recoverSpan:5000,
        //设置失联的判断时间
        timeOut:3000,
        //过滤掉重复的数据
        deDuplication:false
    },
    persistence:{//存档配置
        pathTempl:'../assets/monitors/{yyyy}{mm}',
        imageTempl:'{dd}-{hh}{mi}{ss}-{iter}-{prefix}',
        videoTempl:'{dd}-{hh}{mi}{ss}-{prefix}',
        captureSpan:3
    },
    root:path.resolve(__dirname,'../'),
    begin:new Date().getTime(),
    runtimeLength:function () {
        return new Date().getTime()-config.begin;
    },
    getAbsolutePath(name){
        //console.log(name + " path:" +path.resolve(config.root,name));
        return path.resolve(config.root,name);
    },
    getConfig(name){
        return require('./'+name);
    },
    getLogDir(){
      return config.getAbsolutePath('../logs');
    },
    getDataDir(name){
      return config.getAbsolutePath('data/'+name);
    },
    getLibDir(){
      return config.getAbsolutePath('clib');
    },
    getData(name){
        return require('../data/'+name);
    },
    getVideoPath(){
      return config.getAbsolutePath('../assets/monitors');
    },
    ipc:{//摄像头工作配置
        /*
        1:预缓存时间，0表示不启动预缓存,则需要画面时才去连接摄像头第一种需要实现的方法
        2:只打开摄像头，不缓存数据，这种模式考虑onvif标准使用yellowstone实现数据的拉取，否则需要建立很多的ffmpeg子线程
        3:预缓存数据，数据缓存指定的时间，可以保证事件发生的过程全部被录制下来
        方式1:的延时可能有2到3秒
        方式2:如果使用线程池可以保证主机信号到及取回录像
        方式3:可以实现全过程录制
        第一期只实现第一种,其他方式模式后续合同更新
        */
        runWay:0,
        //idr按照I帧缓存，遇到下一个I帧时抛弃上一个缓存，frame[time/count]方式下是分析帧类型缓存
        //对于固定顺序输出I帧的使用idr以提高性能，否则通过frame方式
        //farme-time方式下通过time上限方式抛弃帧
        //frame-count通过帧数抛弃抛弃
        pre_cache_type:'idr',
        //idr模式下idr帧的个数，最多3帧，最少1帧,pre_cache_option为具体配置
        //farme-time下为时间,最多3s,最少500ms,单位为ms,pre_cache_option为具体配置
        //frame-count,帧数，最多75帧，最少10帧,pre_cache_option为具体配置
        pre_cache_option:1,
        //ptz自动释放时间，默认为15秒
        ptzLock:15000,
        reConnectSpan:2000
    }
    /*    video:{
            codec:'mpeg1video',
            codea:'mp2',
            f:'mpegts'
        },
        video:{
            codec:'copy'//'libx264'//输出视频格式
            ,codea:'acc'//输出音频格式
            ,f:'flv'//封装格式
            //,s:'600*400'//输出尺寸
        },*/
};

exports=module.exports=config;