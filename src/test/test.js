
const Transform = require('stream').Transform;
const PassThrough=require('stream').PassThrough;
const assert = require('assert');
let config = require('../config/config');
const dhlib=require('../ipcs/dahua/dhnetsdk');
const path = require('path');
const root=require('../config/config').root;
const Event=require('events').EventEmitter;
const amf=require('amf');
const expect=require('chai').expect;
const _=require('lodash');
const cp=require('child_process');

console.log('config.port=' + config.port);

/**
 * describe 测试套件 test suite 表示一组相关的测试
 * it 测试用例 test case 表示一个单独的测试
 * assert 断言 表示对结果的预期
 */

class B{
    constructor(){
        this.x=1;
    }
    funA(){}
    get a(){
        return this.x;
    }
    get b(){
        return 2;
    }
}

class A extends Transform{
    constructor(){
        super();
        //B.call(this); error not new
    }
    get a(){
        return B.prototype.a.call(this);
    }
    _transform(d,e,n){
        n(null,d);
    }
}

class Rotate extends Transform {
    constructor(n) {
        super()
        // 将字母旋转`n`个位置
        this.offset = (n || 13) % 26
    }

    // 将可写端写入的数据变换后添加到可读端
    _transform(buf, enc, next) {
        var res = buf.toString().split('').map(c => {
            var code = c.charCodeAt(0)
            if (c >= 'a' && c <= 'z') {
                code += this.offset
                if (code > 'z'.charCodeAt(0)) {
                    code -= 26
                }
            } else if (c >= 'A' && c <= 'Z') {
                code += this.offset
                if (code > 'Z'.charCodeAt(0)) {
                    code -= 26
                }
            }
            return String.fromCharCode(code)
        }).join('')

        // 调用push方法将变换后的数据添加到可读端
        this.push(res)
        // 调用next方法准备处理下一个
        next()
    }
}

xdescribe('buffer',()=>{
   it('0 test',()=>{
     let buf=buffer.from([0]);
     buf.toString('');
   });
});

describe('amf',()=>{
   xit('read',()=>{
       let b=Buffer.from('080000000900086475726174696f6e000000000000000000000577696474680040760000000000000006686569676874004072000000000000000d766964656f646174617261746500000000000000000000096672616d6572617465004059000000000000000c766964656f636f646563696400401c00000000000000057469746c65020010525453502053657373696f6e2f322e300007656e636f64657202000d4c61766635372e37352e313030000866696c6573697a65000000000000000000000009','hex');
       let obj=amf.read(b,0);
       console.log(obj);
   }) ;
   it('write',()=>{
       let buf=Buffer.allocUnsafe(400);
       let b=Buffer.from('080000000900086475726174696f6e000000000000000000000577696474680040760000000000000006686569676874004072000000000000000d766964656f646174617261746500000000000000000000096672616d6572617465004059000000000000000c766964656f636f646563696400401c00000000000000057469746c65020010525453502053657373696f6e2f322e300007656e636f64657202000d4c61766635372e37352e313030000866696c6573697a65000000000000000000000009','hex');
       let obj=amf.read(b,0);
       let arr=[];
       _.defaults(arr,obj);
       arr.length=_.keys(obj).length;
       let info={};
       amf.write(buf,arr,info);
       let b2=buf.slice(0,info.byteLength);
       assert.deepEqual(b,b2);
   });
});


xdescribe('transform-data',()=>{
    it('do',()=>{
        var transform = new Rotate(3)
        transform.on('data', data => process.stdout.write(data))
        transform.write('hello, ')
        transform.write('world!')
        transform.end()
    });
});


xdescribe('pipe',()=>{
    it('m-pipe',()=>{
        let a=new A();
        let pt=new PassThrough();
        a.pipe(pt);
        a.pipe(pt);
        pt.on('data',console.log);
        a.write('hello');
        a.end();
    });
    xit('event count',(done)=>{
        let a=new A();
        a.on('newListener', (name)=>{
            console.log(`new Event:${name},Count:${a.listenerCount(name)}`)
        });
        a.on('removeListener', (name)=>{
            console.log(`remove Event:${name},Count:${a.listenerCount(name)}`)
        });
        let d=()=>{};
        a.on('data',d);
        expect(a.listenerCount('data')).equal(1);
        a.removeListener('data',d);
        expect(a.listenerCount('data')).equal(0);
        let pt=new PassThrough();
        a.pipe(pt);
        a.end();
        expect(a.listenerCount('data')).equal(1);
        a.unpipe(pt);
        expect(a.listenerCount('data')).equal(0);
        setTimeout(()=>{
            done();
        },10);
    });
});


xdescribe('集成附加组件',function () {
   it('sub.call',function () {
       let b=new A();
       expect(b.x).equal(1);
       expect(b.a).equal(1);
   })
});

xdescribe('promise',function(){
    function a(){
        return new Promise((s,f)=>{
            f('err t')
        });
    }
    function b(){
        return a().then(()=>{});
    }
    it('promise/a+',(done)=>{
        b().then(done).catch(done);
    });
});

xdescribe('enum',()=>{
    it('enum',()=>{
        console.log(dhlib.enums.loginType.get(0).key);
    });
});

xdescribe('path',()=>{
   it('代码路劲',()=>{
       console.log(__dirname);
       console.log(path.resolve(root,'app'));
   });
});

xdescribe('Array', function() {

    describe('#indexOf()', function() {

        function pc(cb,v){
            this.v=v;
            process.nextTick(()=>{
                cb(this.v);
            })
        }

        it('process.nextTick',()=>{
            new pc(console.log,'abc');
            console.log('123');
        });

        xit('should return -1 when the value is not present', function(){
            assert.equal(-1, [1,2,3].indexOf(4));
        });

        xit('length', function(){
            assert.equal(3, [1, 2, 3].length);
        })
    })
});


xdescribe('lodash',()=>{
    it('defaults',()=>{
        let a=[];
        a.a=1;
        let b={b:2};
        assert.deepEqual(a,_.defaults(a,b));
    });
});


describe('array',()=>{
   xit('each',()=>{
      let x=[];x[3]=1;
      let z=_.without(x);
      console.log(z);
      console.log(x);
      _.forEach(x,(xi)=>{
          console.log(xi);
      });
      x.forEach((xi)=>{
          console.log(xi);
      });
      let y=Array.from(x);
      console.log(y);
      let a=x.filter((i)=>{return i;})
       console.log(a);
      let b=_.filter(x,(z)=>{return z;});
   });

   it('lodash.remove',()=>{
       let x=[0,1,2];
       _.remove(x,(i)=>{return i;});
       assert.ok(x.length===1);
   })
});

describe('async测试',()=>{
    async function abc() {
        console.log('async');
        return new Promise((resolve)=>{
            setTimeout(()=>{
                resolve(1);
            },10);
        })
    }
    it('1',async ()=>{
        let x=await abc();
        console.log('x');
        let y=await Promise.resolve(2);
        console.log('y');
        expect(x).equal(1);
    });

    async function Throw() {
        await Promise.reject(1);
    }

    //error
    it('catch',async ()=>{
        let x=await Throw().catch(()=>{
            return Promise.resolve(2);
        });
        console.log(x);
    });
});

describe('cp',()=>{
    it('fork',()=>{
        let file=path.resolve(__dirname,'./init.js');
        cp.fork(file, ['--inspect',`--debug-brk=${12000}`]);
    });
});