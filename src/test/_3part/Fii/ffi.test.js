const ffi=require('ffi');
const ref = require('ref');
const path=require('path');
const BYTEPtr=ref.refType('uchar');
const DHLib=require('../../../app/ipcs/dahua/dhnetsdk');
const expect=require('chai').expect;

let dllPath=path.join(__dirname,'dll/FiiTest');
console.log(dllPath);

let fns= {
    'A':['void',[]],
    'callback_1': ['void', ['pointer']]
};
let CB=function(fn){
    return ffi.Callback.apply(ffi,['void',[BYTEPtr,'int']].concat(fn));
};

let dll=ffi.Library(dllPath, fns);

describe('char',()=>{
    xit('',()=>{
        let x=Buffer.from('预置位1');
        console.log(x.toString('hex'));
    });
    it('预置位1',()=>{
        let buffer=Buffer.from([212,164,214,195,181,227,49,0]);
        expect('预置点1').equal(DHLib.utils.mbcs2Utf8(buffer));
    })
});

xdescribe('callback',()=>{
    it('pointer alloc in nactive c',(done)=>{
        let cb=CB((byteptr,size)=>{
            console.log(`size:${size}`);
            let buffer=ref.readPointer(byteptr.ref(),0,4);
            console.log(buffer[0]);
            console.log(buffer[1]);
            console.log(buffer[2]);
            console.log(buffer[3]);
            done();
        });
        dll.callback_1(cb);
        setTimeout(()=>{
            cb;
        },1100000);
    });
});
