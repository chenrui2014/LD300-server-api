require('../node_modules/H264.js/lib/WebModule');
const H264=require('../node_modules/H264.js/lib/H264');
const fs=require('fs');


describe('看看H264的数据',()=>{
    it('123',(done)=>{
        let fd=fs.createReadStream("d:/h264.dat",{
            flags: 'r',
            encoding: null,
            fd: null,
            mode: 0o666,
            autoClose: false
        });
        let buff=null;
        fd.on('data',(data)=>{
            if(!buff){buff=Buffer.from(data);return;}
            buff=Buffer.concat([buff,data],buff.length+data.length);
        });
        fd.on('end',()=>{
           console.log(JSON.stringify(H264.convertRawStreamToNALUnitObject(buff)));
           done();
        });
    });
});