/**
 * Created by Luky on 2017/6/30.
 */
const ffi=require('ffi');
const dhlib=require('../../app/ipcs/dahua/dhnetsdk');
const ref=require('ref');
const _=require('lodash');
const ArrayType=require('ref-array');
const expect = require('chai').expect;
const fs = require('fs');
//const ip='192.168.1.106',port='37777',name='admin',pwd='888888',channel=0;
const ip='192.168.1.98',port='37777',name='admin',pwd='admin',channel=0;
//const ip='192.168.1.200',port='37777',name='admin',pwd='888888',channel=2;
//const ip='192.168.1.200',port='37777',name='admin',pwd='888888',channel=3;//大华摄像头用onvif连接拉取视频流无效
const Struct = require('ref-struct');
const H264unPack=require('../../app/ipcs/dahua/_dh_h264_unpack');
const PassThrough=require('stream').PassThrough;

const wOption = {
    flags: 'w',
    encoding: null,
    fd: null,
    mode: 0o666,
    autoClose: false
};


describe('函数测试', function() {

    let loginID;
    before(function () {
        let result=dhlib.functions.CLIENT_Init(dhlib.callbacks.fDisConnect(function(loginid,string,port,dwuser){
            console.log('nvr disconnect');
        }),0);
        expect(result).equal(1);
        let err=ref.alloc('int');
        let NET_DEVICEINFO_Ex=new dhlib.structs.NET_DEVICEINFO_Ex();
        loginID=dhlib.functions.CLIENT_LoginEx2(ip,port,name,pwd,0,ref.NULL,NET_DEVICEINFO_Ex.ref(),err);
        //let NET_DEVICEINFO=new dhlib.structs.NET_DEVICEINFO();
        //loginID=dhlib.functions.CLIENT_Login(ip,port,name,pwd,NET_DEVICEINFO.ref(),err);
        expect(loginID).not.equal(0);
        let actualerr= err.deref();
        expect(actualerr).equal(0);
        //logoutStruct(dhlib.structs.NET_DEVICEINFO_Ex,NET_DEVICEINFO_Ex);
        //logoutStruct(dhlib.structs.NET_DEVICEINFO,NET_DEVICEINFO);
    });

    after(function () {
        dhlib.functions.CLIENT_Logout(loginID);
        dhlib.functions.CLIENT_Cleanup();
    });

    it('CLIENT_RealPlayEx视频流播放-分出H264流',function(done){
        let fw=fs.createWriteStream('d:/dhipc_cache1.h264',wOption);
        let fw2=fs.createWriteStream('d:/dhipc_unpacked_fps10.dat',wOption);
        let pack=new H264unPack();
        let p=new PassThrough();
        //pack.setEncoding('ascii');
        pack.pipe(p);
        p.pipe(fw2);
        /*pack.on('data',(data)=>{
            console.log(data.toString('hex'));
        });*/
        
/*        let decCB=dhlib.callbacks.fDecCallBack(function (lid,pid,dec,dec2) {
            console.log(lid);
        });

        dhlib.functions.CLIENT_SetDecCallBack(decCB,0,0);*/

        let callback=dhlib.callbacks.fRealDataCallBackEx(function(rid,dataType,buf,size,param,dwuser){
            //param无意义
            let out=ref.readPointer(buf.ref(),0,size)
            fw.write(out);
            console.log(size);
            console.log(out.toString('hex'));
            //pack.write(out);
            //fw2.write(out.toString('hex'));
        });
        let playID=dhlib.functions.CLIENT_RealPlayEx(loginID,channel,ref.NULL,dhlib.enums.playType.Realplay_1);
        if(!playID){
            console.error(dhlib.functions.CLIENT_GetLastError()&(0x7fffffff));
        }
        let saved=dhlib.functions.CLIENT_SaveRealData(playID,'d:\\dh.h264');

        let cbok=dhlib.functions.CLIENT_SetRealDataCallBackEx(playID,callback,0,0x1f);
        expect(cbok).not.equal(0);

 /*       let cbdc=dhlib.callbacks.fRealPlayDisConnect(function(){
            console.error('display disconnect')
        });
        let playID=dhlib.functions.CLIENT_StartRealPlay(loginID,channel,ref.NULL,dhlib.enums.playType.Realplay,callback,cbdc,0,10000);*/
        expect(playID).not.equal(0);

        setTimeout(()=>{
            dhlib.functions.CLIENT_StopRealPlayEx(playID);
            fw.close();
            callback;
            fw2.close();
            //pack.end();
            done();
        },10000);
    });

    function logoutStruct(struct,data){
        _.each(data.toObject(),(val,key)=>{
            if(struct.fields[key].type.name==='ArrayType'
                &&struct.fields[key].type.type.name==='char'){
                console.log(`${key}:${val.buffer.readCString(0)}`);
            }
            else {
                console.log(`${key}:${val}`);
            }
        });
    }

    xit('CLIENT_QueryDecEncoderInfo查询远程设备信息',function(){
        let s=Buffer.alloc(dhlib.structs.DEV_ENCODER_INFO.size);
        s.type=dhlib.structs.DEV_ENCODER_INFO;
        let ok=dhlib.functions.CLIENT_QueryDecEncoderInfo(loginID,0,2,1000);
        if(!ok){
            console.error(dhlib.functions.CLIENT_GetLastError() & (0x7fffffff));
        }
        let sv=new dhlib.structs.DEV_ENCODER_INFO(s);
        logoutStruct(dhlib.structs.DEV_ENCODER_INFO,sv);
        //sv.szDevIp.buffer.readCString(0)
        //sv.toObject()
        expect(ok).equal(1);
    });

    xit('CLIENT_QuerySystemInfo设备能力查询',()=>{
        let st=dhlib.structs.DH_DEV_ENABLE_INFO;
        let DH_DEV_ENABLE_INFO=new st();
        let nLenRet=ref.alloc('int');
        let ok=dhlib.functions.CLIENT_QuerySystemInfo(loginID,dhlib.enums.DH_SYS_ABILITY.DEVALL_INFO,DH_DEV_ENABLE_INFO.ref(),st.size,nLenRet,1000);
        if(!ok){
            console.error(dhlib.functions.CLIENT_GetLastError() & (0x7fffffff));
        }
        nLenRet=nLenRet.deref();
        expect(ok).equal(1);
        expect(nLenRet).equal(st.size);
        logoutStruct(st,DH_DEV_ENABLE_INFO);
        //摄像头3,3,1,7,1,1,1,1,0,0  ,0,0,0,1,0,0,1,0,0,1  ,5, 0,0,1,2,3,0,0,1, 22,  8, 1,0,0,0,0,0,1,0,0,1   ,0,1,0,0,0,0,0,0,0,1,  0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
        //NVR  :3,7,1,5,0,1,1,0,0,0  ,0,0,0,0,0,0,1,0,0,1  ,7,10,0,1,2,0,0,0,1,175,  17,0,1,0,1,0,3,1,0,1,1   ,1,0,0,0,0,0,0,0,0,0,  0,0,1,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
    });

    xit('CLIENT_GetNewDevConfig查询编码能力',()=>{
        let size=dhlib.structs.DEV_ENCODER_INFO.size;
        let buffer=new Buffer(size);
        let err=ref.alloc('int');
        let code = ref.allocCString('Ptz');
        let ok=dhlib.functions.CLIENT_GetNewDevConfig(loginID,code.ref(),1,buffer,size,err,500);
        if(!ok){
            console.error(dhlib.functions.CLIENT_GetLastError() & (0x7fffffff))
        }
        let actualerr= err.deref();
        expect(ok).equal(1);
        expect(actualerr).equal(0);
        let sv=new dhlib.structs.DEV_ENCODER_INFO(buffer);
        logoutStruct(dhlib.structs.DEV_ENCODER_INFO,sv);
    });

    xit('TALKFORMAT_LIST支持的音频编码格式',()=>{
        let lst=new dhlib.structs.TALKFORMAT_LIST();
        let nLenRet=ref.alloc('int');
        let ok=dhlib.functions.CLIENT_QueryDevState(loginID,dhlib.consts.DEVSTATE_TALK_ECTYPE,lst.ref(),dhlib.structs.TALKFORMAT_LIST.size,nLenRet,1000);
        if(!ok){
            console.log(dhlib.functions.CLIENT_GetLastError()& (0x7fffffff));
        }
        expect(!ok).equal(false);
        expect(nLenRet.deref()).equal(dhlib.structs.TALKFORMAT_LIST.size);
        for(let i=0;i<lst.nSupportNum;i++){
            let lsti=lst.type[i];
            console.log(`AudioBit:${lsti.nAudioBit},Rate:${lsti.dwSampleRate},encode:${lsti.encodeType}`);
        }
        /*AudioBit:16,Rate:8000,encode:1 PCM
        AudioBit:16,Rate:16000,encode:1
        AudioBit:16,Rate:8000,encode:2 DH_TALK_G711a
        AudioBit:16,Rate:16000,encode:2
        AudioBit:16,Rate:8000,encode:4 DH_TALK_G711u
        AudioBit:16,Rate:16000,encode:4
        AudioBit:16,Rate:8000,encode:5 DH_TALK_G726
        AudioBit:16,Rate:8000,encode:8 DH_TALK_AAC
        AudioBit:16,Rate:16000,encode:8*/
        //console.log(lst.toObject());
    });

    xit('CLIENT_SetDeviceMode设置服务端对讲',()=>{
        let ok=dhlib.functions.CLIENT_SetDeviceMode(loginID,dhlib.enums.EM_USEDEV_MODE.DH_TALK_SERVER_MODE,ref.NULL);
        expect(!ok).equal(false);
        let en=dhlib.structs.TALKDECODE_INFO({
            'encodeType':dhlib.enums.TALK_CODING_TYPE.AAC,
            'nAudioBit':8,
            'dwSampleRate':16000
        });
        ok=dhlib.functions.CLIENT_SetDeviceMode(loginID,dhlib.enums.EM_USEDEV_MODE.TALK_ENCODE_TYPE,en.ref());
        expect(!ok).equal(false);
        let sp=new dhlib.structs.NET_SPEAK_PARAM({
            dwSize:dhlib.structs.NET_SPEAK_PARAM.size,
            nMode:0,
            nSpeakerChannel:0,
            bEnableWait:0
        });
        ok=dhlib.functions.CLIENT_SetDeviceMode(loginID,dhlib.enums.EM_USEDEV_MODE.TALK_SPEAK_PARAM,sp.ref());
        let ttp=new dhlib.structs.NET_TALK_TRANSFER_PARAM({
            dwSize:dhlib.structs.NET_TALK_TRANSFER_PARAM.size,
            bTransfer:0
        });
        expect(!ok).equal(false);
        ok=dhlib.functions.CLIENT_SetDeviceMode(loginID,dhlib.enums.EM_USEDEV_MODE.DH_TALK_TRANSFER_MODE,ttp.ref());
        expect(!ok).equal(false);
    });

    xit('报警输出',(done)=>{
        let ap = new dhlib.structs.ALARMCTRL_PARAM({
            dwSize: dhlib.structs.ALARMCTRL_PARAM.size,
            nAlarmNo: 0,
            nAction: 1
        });
        //dhlib.enums.CTRL_TYPE.TRIGGER_ALARM_OUT
        let ok=dhlib.functions.CLIENT_ControlDevice(loginID,101,ap.ref(), 1000);
        expect(ok).equal(1);
        setTimeout(done,1000);
    });

    xit('CLIENT_QueryDevState查询IPC能力',function () {
        let nLenRet=ref.alloc('int');
        let DH_DEV_IPC_INFO=new dhlib.structs.DH_DEV_IPC_INFO();
        //let buffer=DH_DEV_IPC_INFO.ref()//new Buffer(dhlib.structs.DH_DEV_IPC_INFO.size);
        let buffer=ref.alloc(dhlib.structs.DH_DEV_IPC_INFO);
        let bok=dhlib.functions.CLIENT_QueryDevState(
            loginID,
            dhlib.consts.DH_DEVSTATE_IPC,
            DH_DEV_IPC_INFO.ref(),
            dhlib.structs.DH_DEV_IPC_INFO.size,
            nLenRet,
            1000);
        if(!bok){
            console.error(dhlib.functions.CLIENT_GetLastError() & (0x7fffffff));
        }
        expect(bok).equal(1);
        expect(nLenRet.deref()).equal(dhlib.structs.DH_DEV_IPC_INFO.size);
        logoutStruct(dhlib.structs.DH_DEV_IPC_INFO,DH_DEV_IPC_INFO);
 /*       nTypeCount:9
        bSupportTypes:0,2,3,6,8,15,22,0,48,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
  大华
  松下
  索尼
  三星
  安讯视AXIS
  Arecont
  Onvif协议
  大华 ??GB2818
  其他自定义
*/
        let ct=DH_DEV_IPC_INFO.toObject().nTypeCount;
        let spt=DH_DEV_IPC_INFO.toObject().bSupportTypes;
        for(let i=0;i<ct;i++){
            console.log(dhlib.enums.IPC_TYPE.get(spt[i]).key);
        }
    });
});