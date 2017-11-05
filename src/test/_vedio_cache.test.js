/**
 * Created by Luky on 2017/7/16.
 */

const Cache=require('../app/servers/cache/_valve_pipe');
const expect=require('chai').expect;

describe('cache test',()=>{
    xit('无监视不缓存数据',()=>{
        let cache=new Cache(3,256*3);
        cache.append(Buffer.alloc(1),false);
        expect(cache.length).equal(0);
        expect(cache.dispatch(null)).equals(null);
    });

    // 一秒调用2次
    function times(fun,times) {
        times=times*2;
        let index=0;
        let lastSecond=0,a=0;
        let iid=setInterval(()=>{
            let cur=new Date();
            console.log(`毫秒数：${cur.getMilliseconds()}`);
            if(cur.getMilliseconds()>550&&index===0){
                return;
            }
            let sec=cur.getSeconds();
            lastSecond=lastSecond||sec;
            if(sec!==lastSecond){
                a=0;
            }
            else if(a===2){
                return;
            }
            a++;
            lastSecond=sec;
            console.log(`Date:${cur.toLocaleString()},times:${index}`);
            fun(index++);
            times--;
            if(times===0)clearInterval(iid);
        },200);
    }

    xit('测试非擦除数据，3个容量，共3秒测试，每秒两次数据，每次100个值，共600数据量',(done)=>{
        let cache=new Cache(3,100*2*3);
        cache.on('data',(data)=>{
            expect(cache._started).equals(true);
            expect(data.length).equals(600);
            let t=Buffer.alloc(100*3*2,1);
            t.fill(2,200,400);
            t.fill(3,400,600);
            expect(t.equals(data)).equals(true);
            expect(cache._datas[0].length).equals(0);
            expect(cache._datas[0]._buffer.length).equals(200);
            expect(cache._datas[1].length).equals(0);
            expect(cache._datas[1]._buffer.length).equals(200);
            expect(cache._datas[2].length).equals(0);
            expect(cache._datas[2]._buffer.length).equals(200);
            done();
        });
        times((time)=>{
            let buffer=Buffer.alloc(100,Math.floor((time+2)/2));
            cache.append(buffer,time!==3*2-1);
        },3);
    });
    xit('测试数据丢弃，3秒容量，每秒两次数据，每次10个数据,连续六秒',(done)=>{
        let cache=new Cache(3,10*2*3);
        cache.on('data',(data)=>{
            expect(cache._started).equals(true);
            expect(data.length).equals(60);
            let t=Buffer.alloc(10*2*3,4);
            t.fill(5,20,40);
            t.fill(6,40,60);
            expect(t.equals(data)).equals(true);
            expect(cache._datas[0].length).equals(0);
            expect(cache._datas[0]._buffer.length).equals(20);
            expect(cache._datas[1].length).equals(0);
            expect(cache._datas[1]._buffer.length).equals(20);
            expect(cache._datas[2].length).equals(0);
            expect(cache._datas[2]._buffer.length).equals(20);
            done();
        });
        times((time)=>{
            let buffer=Buffer.alloc(10,Math.floor((time+2)/2));
            cache.append(buffer,time!==6*2-1);
        },6);
    });

    it('单秒容量不足及性能测试',(done)=>{
        let len=1024*1024*100;
        let cache=new Cache(3);
        let times=0,lastSecond=0;
        let buffer=Buffer.alloc(len,1);
        cache.on('data',(data)=> {
            expect(Buffer.alloc(times*len,1).equals(data)).equals(true);
            console.log(`length:${times*len/1024/1024}M`);//1000M单秒的计入
            done();
        });
        let iid=setInterval(()=>{
            let cur=new Date();
            if(times===0&&cur.getMilliseconds()>100)
            {
                return;
            }
            lastSecond=lastSecond||cur.getSeconds();
            times++;
            if(lastSecond!==cur.getSeconds()){
                clearInterval(iid);
                cache.append(buffer,false);
                return;
            }
            cache.append(buffer,true);
        },10);
    });

});
