'use strict';

//rtsp://admin:admin@192.168.1.98:554/cam/realmonitor?channel=1&subtype=0&unicast=true&proto=Onvif

var RtspClient = require('../../_3part/yellowstone/lib/index').RtspClient;
var H264Transport = require('yellowstone').H264Transport;
//const url='rtsp://192.168.1.98:554/cam/realmonitor?channel=1&subtype=1&unicast=true&proto=Onvif';
var url = 'rtsp://192.168.1.106:554/cam/realmonitor?channel=1&subtype=1&unicast=true&proto=Onvif';
var pwd = 'admin';
var fs = require('fs');

var wOption = {
    flags: 'w',
    encoding: null,
    fd: null,
    mode: 438,
    autoClose: true
};

describe('测试RTSP_client', function () {
    it('心跳测试', function (done) {
        var client = new RtspClient('admin', pwd);
        client.connect(url, { keepAlive: true }).then(function (details) {
            console.log('Connected. Video format is', details.format);
            /*            setInterval(()=>{
                            client.request("OPTIONS");
                        },1000);*/
            client.play();
        });

        // data == packet.payload, just a small convenient thing
        // data is for RTP packets
        client.on('data', function (channel, data, packet) {
            console.log('RTP Packet', 'ID=' + packet.id, 'TS=' + packet.timestamp, 'M=' + packet.marker, 'Type=' + packet.type);
            //console.log(data.toString('hex'));
        });

        client.on('controlData', function (channel, rtcpPacket) {
            console.log('RTCP Control Packet', 'TS=' + rtcpPacket.timestamp, 'PT=' + rtcpPacket.packetType);
        });

        client.on('log', function (data, prefix) {
            console.log(prefix + ': ' + data);
        });

        setTimeout(function () {
            client.close(true);
            done();
        }, 100000);
    });

    it('取回包', function (done) {
        var client = new RtspClient('admin', pwd);

        var fw = fs.createWriteStream('d:/yellowstone.txt', wOption);
        var fw2 = fs.createWriteStream('d:/yellowstone.dat', wOption);

        // details is a plain Object that includes...
        //   format - string
        //   mediaSource - media portion of the SDP
        //   transport RTP and RTCP channels

        client.connect(url, { keepAlive: true }).then(function (details) {
            console.log('Connected. Video format is', details.format);

            // Open the output file
            if (details.format === 'H264') {
                var h264 = new H264Transport(client, fs.createWriteStream("d:/bigbuckbunny.dat"), details);
            }
            console.log(details);

            client.play();
        });

        // data == packet.payload, just a small convenient thing
        // data is for RTP packets
        client.on('data', function (channel, data, packet) {
            console.log('RTP Packet', 'ID=' + packet.id, 'TS=' + packet.timestamp, 'M=' + packet.marker);
            /*            if(packet.marker!==1) return;
                        fw.write(packet.payload.toString('hex')+'\r\n');
                        fw2.write(packet.payload);*/
        });

        // control data is for RTCP packets
        client.on('controlData', function (channel, rtcpPacket) {
            console.log('RTCP Control Packet', 'TS=' + rtcpPacket.timestamp, 'PT=' + rtcpPacket.packetType);
        });

        // allows you to optionally allow for RTSP logging
        // also allows for you to hook this into your own logging system easily
        client.on('log', function (data, prefix) {
            console.log(prefix + ': ' + data);
        });

        setTimeout(function () {
            fw.close();
            fw2.close();
            client.close(true);
            done();
        }, 10000);
    });
});
//# sourceMappingURL=onvif_client_yellowstone.test.js.map