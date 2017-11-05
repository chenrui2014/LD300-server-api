/**
 * Created by Luky on 2017/7/17.
 */

const HB=require('../app/rtsp/rtsp_heartbeat');
const ONVIF=require('../app/ipcs/onvif/onvif_ipc');
const cfg=require('./data/dhipc_onvif.json');
const expect = require('chai').expect;
const RtspClient=require('../_3part/yellowstone').RtspClient;


describe('RTSP心跳测试',()=> {

    xit('yellowstone测试',(done)=>{
        let ipc = new ONVIF(cfg);
        ipc._realPlay().then((uri)=> {
            let client=new RtspClient('admin','admin');
            client.connect(uri, { keepAlive: true }).then((details)=>{
                setTimeout(done,2000);
                console.log(details);
            }).catch(done);
        }).catch(done);
    });

    it('abc', (done) => {
        let ipc = new ONVIF(cfg);
        ipc._realPlay().then((uri)=> {
            console.log('rtsp地址取回成功链接成功');
            let hb=new HB(uri,'admin','admin');
                hb.listen();
            let i=0;
            hb.on('online',()=>{
                i++;
                if(i===10)done();
                console.log('服务在线')
            });
            //手动拔网线测试
            hb.on('offline',(e)=>{
                i++;
                console.error('服务掉线');
                done(e);
            });
        }).catch(done);
    });
});