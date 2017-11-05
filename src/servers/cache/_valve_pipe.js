/**
 * Created by Luky on 2017/7/19.
 */

const Transform=require('stream').Transform;
const _=require('lodash');
const assert=require('assert');
const EventEmitter = require('events').EventEmitter;

class List{
    constructor(capacity){
        capacity=capacity||512;
        this._buffer=Buffer.allocUnsafe(capacity);
        this._length=0;
    }
    get length(){
        return this._length;
    }
    copyTo(target,start){
        if(!this._length) return 0;
        this._buffer.copy(target,start,0,this.length);
        return this.length;
    }
    clear(){
        this._length=0;
    }
    append(buffer){
        if(this._buffer.length-this._length<buffer.length){
            console.warn(`内存增长(KB)${this._buffer.length/1024}=>${(this._buffer.length+3*buffer.length)/1024}`);
            let tmp=Buffer.allocUnsafe(this._buffer.length+3*buffer.length);
            this._buffer.copy(tmp,0,0,this._length);
            delete this._buffer;
            buffer.copy(tmp,this._length);
            this._buffer=tmp;
            this._length+=buffer.length;
        }
        else{
            buffer.copy(this._buffer,this._length);
            this._length+=buffer.length;
        }
    }
}

class Cache extends Transform{
    constructor(timeout=0,capacity=0,open=false){
        super();
        this._timeout=timeout;
        if(this._timeout){
            //不提供缓存功能的阀门，来的数据都丢掉
            this._datas=new Array(timeout);
            capacity=capacity||(512*timeout);
            capacity=Math.floor(capacity/timeout);
            for(let i=0;i<timeout;i++){
                this._datas[i]=new List(capacity);
            }
        }
        this._length=0;
        this._pos=0;
        this._lastTime=0;
        this._output=false;
        if(open){
            this.open();
        }
    }

    open(){
        this._output=true;
    }

    close(){
        this._output=false;
    }

    _transform(buf,enc,next){
        if(this._output)this.push(this.dispatch(buf));
        else this.append(buf);
        next();
    }

    clear() {
        let current=curSecond();
        this._lastTime=this._lastTime||current;
        if(this._lastTime!==current&&this._length){
            for(let i=this._lastTime+1,j=0;i<=current&&j<this._timeout;i++){
                let lst=this._datas[i%this._timeout];
                this._length-=lst.length;
                lst.clear();
            }
        }
        return current;
    }

    append(data){
        if(!this._timeout) return;
        this._lastTime=this.clear();
        this._pos=this._lastTime%this._timeout;
         if(!data||!data.length) return;
        //console.log(`pos:${this._pos}`);
        console.log(`位置${this._pos}当前缓存大小(KB)${Math.floor(this._datas[this._pos].length/1024)},实际内存大小${Math.floor(this._datas[this._pos]._buffer.length/1024)}`);
        this._datas[this._pos].append(data);
        this._length+=data.length;
    }

    dispatch(data){
        if(!this._length) return data;
        let length=this._length+(data?data.length:0);
        let buffer=Buffer.allocUnsafe(length);
        let pos=this._pos,len=0;
        for(let i=0,p=(pos+1)%this._timeout;i<this._timeout;i++){
            let lst=this._datas[p];
            p=(p+1)%this._timeout;
            len+=lst.copyTo(buffer,len);
            lst.clear();
        }
        if(data){
            data.copy(buffer,len);
        }
        this._length=0;
        return buffer;
    }
}

function curSecond() {
    return Math.floor(new Date().getTime()/1000);
}

exports=module.exports=Cache;