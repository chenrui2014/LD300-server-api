const ffi=require('ffi');
const ref = require('ref');
const struct = require('ref-struct');
const Enum=require('enum');
const ArrayType=require('ref-array');
const _=require('lodash');
const path=require('path');
const process=require('process');
const isX64=process.arch==='x64';
//const isLinux=process.platform.indexOf('win')===-1;
const EventEmitter = require('events');
const util = require('util');
const legacy = require('legacy-encoding');
const config=global.server_config||require('../../config/config');
let dll=path.join(config.getLibDir(),(isX64?'DHNetSDK/x64/dhnetsdk':'DHNetSDK/x32/dhnetsdk'));
//console.log("dll path" + dll);
let bool=ref.types.bool;
let char=ref.types.char;
let uchar=ref.types.uchar;
let int=ref.types.int;
let ushort=ref.types.ushort;
let long=ref.types.long;
let ulong=ref.types.ulong;
let longlong=ref.types.longlong;
let float=ref.types.float;
let string=ref.types.CString;
let ENUM=int;

let BYTE=uchar;
let WORD=ushort;
let DWORD=ulong;
let LDWORD=ulong;
let LLONG=long;
let LONG=long;
let BOOL=int;

let voidPtr=ref.refType('void');
let HWND=voidPtr;
let charPtr=ref.refType('char');
let BYTEPtr=ref.refType('uchar');
let intPtr=ref.refType('int');

if(isX64){
    LLONG=ref.types.int64;
    LDWORD=ref.types.int64;
}
let enums={};
let structs={};
let callbacks={};
let consts={};
let utils={};

consts.DH_SERIALNO_LEN=48;
consts.PTZ_PRESET_NAME_LEN=64;
consts.DH_DEVSTATE_IPC=0x0025;
consts.DH_MAX_IPADDR_LEN=16;
consts.DH_USER_NAME_LENGTH_EX=16;
consts.DH_USER_PSW_LENGTH_EX=16;
consts.DH_MAX_IPADDR_OR_DOMAIN_LEN=64;
consts.DH_DEVSTATE_PTZ_LOCATION=0x36;
consts.DH_DEVSTATE_PTZ_PRESET_LIST=0x57;
consts.CFG_CMD_ENCODE='Encode';
consts.DEVSTATE_TALK_ECTYPE=9;


callbacks.fDisConnect=function(fn){
    return ffi.Callback.apply(ffi,['void',[longlong,string,long,LDWORD]].concat(fn));
};
callbacks.fRealDataCallBackEx=function(fn){
    return ffi.Callback.apply(ffi,['void',[LLONG,DWORD,BYTEPtr,DWORD,LONG,LDWORD]].concat(fn));
};
callbacks.pfAudioDataCallBack=function (fn) {
    return ffi.Callback.apply(ffi,['void',[LLONG,BYTEPtr,DWORD,BYTE,LDWORD]].concat(fn));
};
callbacks.fRealPlayDisConnect=function (fn) {
    return ffi.Callback.apply(ffi,['void',[LLONG,ENUM,voidPtr,LDWORD]].concat(fn));
};

callbacks.fHaveReConnect=function (fn) {
    return ffi.Callback.apply(ffi,['void',[LLONG,string,LONG,LDWORD]].concat(fn));
};

callbacks.fDecCallBack=function (fn) {
    return ffi.Callback.apply(ffi,['void',[LLONG,string,LONG,LDWORD]].concat(fn));
};

enums.loginType= new Enum({"TCP":0}, { 'freez': true });
enums.playType=new Enum({
    'Realplay':0,'Multiplay':1,'Realplay_0':2,'Realplay_1':3,
    'Realplay_2':4,'Realplay_3':5},{ 'freez': true });
enums.PTZ=new Enum({
    'PTZ_UP':0,'PTZ_DOWN':1,'PTZ_LEFT':2,'PTZ_RIGHT':3,'PTZ_ZOOM_ADD':4,
    'PTZ_ZOOM_DEC':5,'PTZ_FOCUS_ADD':6,'PTZ_FOCUS_DEC':7,'PTZ_APERTURE_ADD':8,
    'PTZ_APERTURE_DEC':9,'PTZ_POINT_MOVE':10,'PTZ_POINT_SET':11,'PTZ_POINT_DEL':12,
    'PTZ_POINT_LOOP':13,'PTZ_LAMP':14,
    'EXTPTZ_LEFTTOP':0x20,'EXTPTZ_RIGHTTOP':0x21,'EXTPTZ_LEFTDOWN':0x22,'EXTPTZ_RIGHTDOWN':0x23,
    'EXTPTZ_MOVE_ABSOLUTELY':0x45
},{ 'freez': true });
enums.REALPLAY_DISCONNECT_EVENT=new Enum({'REAVE':0,'NETFORBID':1,'SUBCONNECT':2},{ 'freez': true });
enums.CTRL_TYPE=new Enum({
    'TRIGGER_ALARM_IN':100,'TRIGGER_ALARM_OUT':101},{ 'freez': true });
enums.USEDEV_MODE=new Enum({'TALK_CLIENT_MODE':0,'TALK_SERVER_MODE':1,'TALK_ENCODE_TYPE':2,
    'TALK_CHANNEL':5,'TALK_SPEAK_PARAM':7,'TALK_MODE3':9,'TALK_TRANSFER_MODE':11
},{ 'freez': true });
enums.TALK_CODING_TYPE=new Enum({'DEFAULT':0,'PCM':1,'G711a':2,'ARM':3,'G711u':4,'G726':5,'G723_53':6
    ,'G723_63':7,'AAC':8,'OGG':9,'G729':10,'MPEG2':11,'MPEG2_Layer2':12,'G722_1':13,'ADPCM':21,'MP3':22
},{ 'freez': true });
enums.Dev_State=new Enum({'TALK_ECTYPE':9,'LOCATION_INFO':0x36,'PTZ_PRESET_LIST':0x57},{ 'freez': true });
enums.IPC_TYPE=new Enum({
    '大华':0,'美电贝尔':1,'松下':2,'索尼':3,'Dynacolor':4,'天城威视':5,'三星':6,'YOKO':7,'安讯视AXIS':8,'三洋':9,
    'Bosch':10,'Peclo':11,'Provideo':12,'ACTi':13,'Vivotek':14,'Arecont':15,'PrivateEH':16,'IMatek':17,'Shany':18,
    '动力盈科':19,'Ura':20,'Bticino':21,'Onvif协议':22,'视霸':23,'亚安':24,'Airpop':25,'TYCO':26,'讯美':27,'海康':28,
    'LG':29,'奥奇曼':30,'宝康':31,'Watchnet':32,'Xvision':33,'富士通':34,'Canon':35,'GE':36,'巴斯勒':37,'帕特罗':38,
   'CPPLUS K':39,'CPPLUS R':40,'CPPLUS U':41,'CPPLUS IPC':42,'讯美s-ONVIF':43,'广东电网':44,'PSIA':45,'GB2818':46,'GDYX':47,
    '其他自定义':48,'CPPLUS NVR':49,'CPPLUS DVR':50,'Airlive':51,'NPE':52,'AXVIEW':53,'东方网力':54,'HYUNDAI DVR':56,
    '爱普华顿':57,'微创':58,'成都佳发':59,'JVC':60,'英飞拓':61,'ADT':62,'海南创先':63,'CPPLUS 球机':64,'海信':65,'天津高速':66,
    '组播':79,'RVi':84
},{ 'freez': true });
enums.DH_SYS_ABILITY=new Enum({'DEVALL_INFO':26},{ 'freez': true })
enums.DH_DEV_ENABLE=new Enum({'JSON_CONFIG':30,'HIDE_FUNCTION':31},{ 'freez': true });
enums.EM_DH_PTZ_PRESET_STATUS=new Enum({'UNKNOWN':0,'REACH':1,'UNREACH':2},{ 'freez': true });
enums.EM_USEDEV_MODE=new Enum({'TALK_CLIENT_MODE':0,'TALK_SERVER_MODE':1,'TALK_ENCODE_TYPE':2,'ALARM_LISTEN_MODE':3,
    'CONFIG_AUTHORITY_MODE':4,'TALK_TALK_CHANNEL':5,'RECORD_STREAM_TYPE':6,'TALK_SPEAK_PARAM':7,'RECORD_TYPE':8,
    'TALK_MODE3':9,'PLAYBACK_REALTIME_MODE':10,'TALK_TRANSFER_MODE':11,'TALK_VT_PARAM':12,'TARGET_DEV_ID':13
},{ 'freez': true });
enums.DH_TALK_CODING_TYPE=new Enum({'AAC':8},{ 'freez': true });
enums.NET_EM_VIDEO_COMPRESSION=new Enum({'H264':7},{ 'freez': true });
enums.EM_H264_PROFILE_RANK=new Enum({'BASELINE':1,'MAIN':2,'EXTENDED':3,'HIGH':4},{ 'freez': true });
enums.NET_EM_FORMAT_TYPE=new Enum({'EXTRA1':4,'EXTRA2':4,'EXTRA3':6},{'freez': true });
enums.NET_EM_BITRATE_CONTROL=new Enum({'CBR':0,'VBR':1},{'freez': true });
enums.NET_EM_IMAGE_QUALITY=new Enum({Q10:1,Q30:2,Q50:3,Q60:4,Q80:5,Q100:6},{'freez': true });
enums.EM_DECODE_FRAME_TYPE=new Enum({UNKNOWN:-1,VIDEO:0,AUDIO:1},{'freez': true });

structs.NET_DEVICEINFO=struct({
    'sSerialNumber':ArrayType(BYTE,consts.DH_SERIALNO_LEN),
    'nAlarmInPortNum':BYTE,
    'nAlarmOutPortNum':BYTE,
    'byDiskNum':BYTE,
    'byDVRType':BYTE,
    'byChanNum':BYTE
});
structs.NET_DEVICEINFO_Ex=struct({
    'sSerialNumber':ArrayType(BYTE,consts.DH_SERIALNO_LEN),
    'nAlarmInPortNum':int,
    'nAlarmOutPortNum':int,
    'nDiskNum':int,
    'nDVRType':int,
    'nChanNum':int,
    'byLimitLoginTime':BYTE,
    'byLeftLogTimes':BYTE,
    'bReserved':ArrayType(BYTE,2),
    'nLockLeftTime':int,
    'Reserved':ArrayType(char,32)
});
structs.ALARMCTRL_PARAM=struct({
    'dwSize':DWORD,
    'nAlarmNo':int,
    'nAction':int
});
structs.NET_SPEAK_PARAM=struct({'dwSize':DWORD,'nMode':int,'nSpeakerChannel':int});
structs.NET_TALK_TRANSFER_PARAM=struct({'dwSize':DWORD,'bTransfer':BOOL});
structs.NET_PTZ_PRESET=struct({'nIndex':int,'szName':ArrayType(char,consts.PTZ_PRESET_NAME_LEN),'szReserve':ArrayType(char,64)});
structs.NET_PTZ_PRESET_LIST=struct({'dwSize':DWORD,'dwMaxPresetNum':DWORD,'dwRetPresetNum':DWORD,'pstuPtzPorsetList':'pointer'});
structs.DH_DEV_IPC_INFO=struct({'nTypeCount':int,'bSupportTypes':ArrayType(BYTE,128)});
structs.DEV_ENCODER_INFO=struct({
    'szDevIp':ArrayType(char,consts.DH_MAX_IPADDR_LEN),
    'wDevPort':WORD,
    'bDevChnEnable':BYTE,
    'byDecoderID':BYTE,
    'szDevUser':ArrayType(char,consts.DH_USER_NAME_LENGTH_EX),
    'szDevPwd':ArrayType(char,consts.DH_USER_PSW_LENGTH_EX),
    'nDevChannel':int,
    'nStreamType':int,
    'byConnType':BYTE,
    'byWorkMode':BYTE,
    'wListenPort':WORD,
    'dwProtoType':DWORD,
    'szDevName':ArrayType(char,64),
    'byVideoInType':BYTE,
    'szDevIpEx':ArrayType(char,consts.DH_MAX_IPADDR_OR_DOMAIN_LEN),
    'bySnapMode':BYTE,
    'byManuFactory':BYTE,
    'byDeviceType':BYTE,
    'byDecodePolicy':BYTE,
    'bReserved':ArrayType(BYTE,3),
    'dwHttpPort':DWORD,
    'dwRtspPort':DWORD,
    'szChnName':ArrayType(char,32),
    'dwDecoderID':DWORD
});
structs.CFG_VIDEO_FORMAT=struct({
    'abCompression':bool,
    'abWitdh':bool,
    'abHeight':bool,
    'abBitRateControl':bool,
    'abBitRate':bool,
    'abFrameRate':bool,
    'abImageQuality':bool,
    'abFrameType':bool,
    'emCompression':ENUM,
    'nWidth':int,
    'nHeight':int,
    'emBitRateControl':ENUM,
    'nBitRate':int,
    'nFrameRate':int,
    'nIFrameInterval':int,
    'emImageQuality':int,
    'nFrameType':int
});
structs.CFG_AUDIO_ENCODE_FORMAT=struct({
    'abCompression':bool,
    'abDepth':bool,
    'abFrequency':bool,
    'abMode':bool,
    'abFrameType':bool,
    'abPacketPeriod':bool,
    'emCompression':ENUM,
    'nDepth':int,
    'nFrequency':int,
    'nMode':int,
    'nFrameType':int,
    'nPacketPeriod':int
});
structs.CFG_VIDEOENC_OPT=struct({
    'abVideoEnable':bool,
    'abAudioEnable':bool,
    'abSnapEnable':bool,
    'abAudioAdd':bool,
    'abAudioFormat':bool,
    'bVideoEnable':BOOL,
    'stuVideoFormat':structs.CFG_VIDEO_FORMAT,
    'bAudioEnable':BOOL,
    'bSnapEnable':BOOL,
    'stuAudioFormat':structs.CFG_AUDIO_ENCODE_FORMAT
});
structs.DH_DEV_ENABLE_INFO=struct({ 'IsFucEnable':ArrayType(DWORD,512)});
structs.PTZ_SPACE_UNIT=struct({
    'nPositionX':int,
    'nPositionY':int,
    'nZoom':int,
    'szReserve':ArrayType(char,32)
});
structs.PTZ_SPEED_UNIT=struct({
    'fPositionX':float,
    'fPositionY':float,
    'fZoom':int,
    'szReserve':ArrayType(char,32)
});
structs.PTZ_CONTROL_ABSOLUTELY=struct({
    'stuPosition':structs.PTZ_SPACE_UNIT,
    'stuSpeed':structs.PTZ_SPEED_UNIT,
    'szReserve':ArrayType(char,64)
});
structs.DH_PTZ_LOCATION_INFO=struct({
    'nChannelID':int,
    'nPTZPan':int,
    'nPTZTilt':int,
    'nPTZZoom':int,
    'bState':BYTE,
    'bAction':BYTE,
    'bFocusState':BYTE,
    'bEffectiveInTimeSection':BYTE,
    'nPtzActionID':int,
    'dwPresetID':DWORD,
    'fFocusPosition':float,
    'bZoomState':BYTE,
    'bReserved':ArrayType(BYTE,3),
    'dwSequence':DWORD,
    'dwUTC':DWORD,
    'emPresetStatus':ENUM,
    'nZoomValue':int,
    'reserved':ArrayType(int,244)
});
structs.NET_SPEAK_PARAM=struct({
    'dwSize':DWORD,
    'nMode':int,//0d对讲，1喊话
    'nSpeakerChannel':int,//喊话时有效
    'bEnableWait':BOOL//等待设备响应，默认不等待
});
structs.NET_TALK_TRANSFER_PARAM=struct({
    'dwSize':DWORD,
    'bTransfer':BOOL//true开启转发,false 关闭转发
});
structs.TALKDECODE_INFO=struct({
    'encodeType':ENUM,
    'nAudioBit':int,
    'dwSampleRate':DWORD,
    'nPacketPeriod':int,//打包周期，仅仅支持25，单位ms
    'reserved':ArrayType(char,60)
});
structs.NET_ENCODE_VIDEO_INFO=struct({
    'dwSize':DWORD,
    'emFormatType':ENUM,
    'bVideoEnable':BOOL,
    'emCompression':ENUM,
    'nWidth':int,
    'nHeight':int,
    'emBitRateControl':ENUM,
    'nBitRate':int,
    'nFrameRate':float,
    'nIFrameInterval':int,
    'emImageQuality':ENUM
});
structs.TALKFORMAT_LIST=struct({
    nSupportNum:int,
    type:ArrayType(structs.TALKDECODE_INFO,64),
    reserved:ArrayType(char,64)
});

structs.NET_TIME_EX=struct({
    dwYear:DWORD,// 年
    dwMonth:DWORD,// 月
    dwDay:DWORD,// 日
    dwHour:DWORD,// 时
    dwMinute:DWORD,// 分
    dwSecond:DWORD,// 秒
    dwMillisecond:DWORD,// 毫秒
    dwReserved:ArrayType(DWORD,2)// 保留字段
});

structs.SYSTEMTIME=struct({
    wYear:WORD,
    wMonth:WORD,
    wDayOfWeek:WORD ,
    wDay:WORD,
    wHour:WORD,
    wMinute:WORD,
    wSecond:WORD,
    wMilliseconds:WORD,
});

structs.NET_FRAME_INFO_EX=struct({
    dwSize:DWORD,
    emFrameType:ENUM,//视频帧类型,见上面定义
    nFrameSeq:int,//帧序号
    nStamp:int,//时标信息,单位毫秒
    nWidth:int,//画面宽,单位像素.如果是音频数据则为0.
    nHeight:int,//画面高,如果是音频数据则为0
    nFrameRate:int,//编码时产生的图像帧率
    nChannels:int,//音频通道数
    nBitPerSample:int,//音频采样位数
    nSamplesPerSec:int,//音频采样频率
    nRemainData:int,//缓冲剩余数据量
    nDataTime:structs.NET_TIME_EX,//时间
});

structs.FRAME_INFO_EX=struct({
    emFrameType:int,//视频帧类型,见上面定义
    nFrameSeq:int,//帧序号
    nStamp:int,//时标信息,单位毫秒
    nWidth:int,//画面宽,单位像素.如果是音频数据则为0.
    nHeight:int,//画面高,如果是音频数据则为0
    nFrameRate:int,//编码时产生的图像帧率
    nChannels:int,//音频通道数
    nBitPerSample:int,//音频采样位数
    nSamplesPerSec:int,//音频采样频率
    nRemainData:int,//缓冲剩余数据量
    nDataTime:structs.SYSTEMTIME,//时间
    nReserved:ArrayType(int,59)
});

structs.NET_FRAME_DECODE_INFO=struct(
{
    dwSize:DWORD,
    emFrameType:ENUM,//帧类型,定义见FRAME_INFO_EX里nFrameType字段
    pAudioData:voidPtr,//音频数据,如果是音频帧
    nAudioDataLen:int,//音频数据长度
    pVideoData:ArrayType(voidPtr,3),//分别表示视频的YUV三个分量
    nStride:ArrayType(int,3),//分别表示YUV三个分量的跨距
    nWidth:ArrayType(int,3),//分别表示YUV三个分量的宽度
    nHeight:ArrayType(int,3)//分别表示YUV三个分量的高度
});

structs.AUDIO_FORMAT=struct({
    byFormatTag:BYTE,
    nChannels:WORD,
    wBitsPerSample:WORD,
    nSamplesPerSec:DWORD
});

//CLIENT_GetDevConfig,CLIENT_SetDevConfig,CLIENT_GetDevConfig 设置视频流特性
let fns={
    'CLIENT_Init':[BOOL,['pointer',LDWORD]]
    ,'CLIENT_Cleanup':['void',[]]
    ,'CLIENT_Login':[LLONG,[string,WORD,string,string,'pointer',intPtr]]
    ,'CLIENT_LoginEx2':[LLONG,[string,WORD,string,string,ENUM,voidPtr,'pointer',intPtr]]
    ,'CLIENT_Logout':[BOOL,[LLONG]]
    ,'CLIENT_SetAutoReconnect':['void',['pointer',LDWORD]]
    //仅仅nvr下可用，摄像头无线超时，可能是nvr的缓存函数后程序问题
    ,'CLIENT_StartRealPlay':[LLONG,[LLONG,int,HWND,ENUM,'pointer','pointer',LDWORD,DWORD]]
    ,'CLIENT_RealPlayEx':[LLONG,[LLONG,int,HWND,ENUM]]
    ,'CLIENT_SetDecCallBack':['void',['pointer',LDWORD,LLONG]]
    ,'CLIENT_StopRealPlayEx':[BOOL,[LLONG]]
    ,'CLIENT_SetRealDataCallBackEx':[BOOL,[LLONG,'pointer',LDWORD,DWORD]]
    ,'CLIENT_SaveRealData':[BOOL,[LLONG,string]]
    ,'CLIENT_StopSaveRealData':[BOOL,[LLONG]]
    ,'CLIENT_GetLastError':[DWORD,[]]
    ,'CLIENT_PTZControl':[BOOL,[LLONG,int,DWORD,DWORD,BOOL]]
    ,'CLIENT_DHPTZControl':[BOOL,[LLONG,int,DWORD,BYTE,BYTE,BYTE,BOOL]]
    ,'CLIENT_DHPTZControlEx2':[BOOL,[LLONG,int,DWORD,long,long,long,BOOL,voidPtr]]
    ,'CLIENT_ControlDevice':[BOOL,[LLONG,ENUM,voidPtr,int]]
    ,'CLIENT_ControlDeviceEx':[BOOL,[LLONG,ENUM,voidPtr,voidPtr,int]]
    ,'CLIENT_StartTalkEx':[LLONG,[LLONG,'pointer',LDWORD]]
    ,'CLIENT_StopTalkEx':[BOOL,[LLONG]]
    ,'CLIENT_TalkSendData':[LONG,[LLONG,charPtr,DWORD]]
    ,'CLIENT_SetVolume':[BOOL,[LLONG,int]]
    ,'CLIENT_SetDeviceMode':[BOOL,[LLONG,ENUM,voidPtr]]
    ,'CLIENT_QuerySystemInfo':[BOOL,[LLONG,int,charPtr,int,intPtr,int]]
    ,'CLIENT_GetConfig':[BOOL,[LLONG,ENUM,int,voidPtr,DWORD,int,voidPtr]]
    ,'CLIENT_GetNewDevConfig':[BOOL,[LLONG,string,int,charPtr,DWORD,intPtr,int]]
    ,'CLIENT_QueryDevState':[BOOL,[LLONG,int,charPtr,int,intPtr,int]]
    //QueryDecEncoderInfo的第二个参数为nvr中的通道号减一
    ,'CLIENT_QueryDecEncoderInfo':[BOOL,[LLONG,int,'pointer',int]]
/*    ,'CLIENT_OpenSound':[BOOL,[LLONG]]
    ,'CLIENT_CloseSound':[BOOL,[]]*/
};
//CFG_ENCODE_INFO
//CFG_AUDIO_ENCODE_FORMAT
//
/*if(!isLinux){
    fns=_.defaults(fns, {
        'CLIENT_RecordStartEx': [BOOL, [LLONG]]
        ,'CLIENT_RecordStopEx': [BOOL, [LLONG]]
    });
}*/

utils.readBuffer=function(bytePtr,size) {
    return ref.readPointer(bytePtr.ref(),0,size);
};

utils.mbcs2Utf8=function(buf) {
    buf=ArrayType(char).untilZeros(buf).buffer;
    return legacy.decode(buf,'gb2312');
};

utils.utf82Mbcs=function(buf){
    return legacy.encode(buf,'gb2312');
};

exports=module.exports= (function(){
    function DHLib(){
        _.assign(this,{
            'functions':ffi.Library(dll, fns),
            'enums':enums,
            'callbacks':callbacks,
            'structs':structs,
            'consts':consts,
            'utils':utils
        });
    }
    util.inherits(DHLib, EventEmitter);
    return new DHLib();
})();