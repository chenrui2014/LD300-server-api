/**
 * Created by Luky on 2017/7/2.
 */
const Transform=require('stream').Transform;
const assert=require('assert');
const naluPrefix=Buffer.from([0,0,1]);
const DHAV=Buffer.from([0x44,0x48,0x41,0x56]);
const dhav=Buffer.from([0x64,0x68,0x61,0x76]);
const emptyBuffer=Buffer.alloc(0);

class DHH264UnPick extends Transform{

    constructor(skipPrefix=true){
        super({ objectMode: true });
        this._c=emptyBuffer;
        this._skip0001=skipPrefix;
    }
    static findPrefixAndSize(buff,start=0){
        let index=buff.indexOf(naluPrefix,start);
        if(index>0&&buff[index-1]===0){
            return [index-1,4];
        }
        return [index,(index!==-1?3:0)];
    }

    _transform(buf,enc,next){
        /*next(null,buf.toString('hex')+'\r\n');
        return;*/
        if(buf.slice(0,4).indexOf(DHAV)===0){
            buf=buf.slice(40);//DHAV和不知道是什么数据结构的数据
        }
        let [index,size]=DHH264UnPick.findPrefixAndSize(buf);
        if(-1===index){
            //assert.ok(buf[4]!==0xfc);
            //console.log(buf.toString('utf8'));
            next();return;
        }
        if(this._c.length){
            assert.ok(buf.slice(0,4).indexOf(DHAV)===-1);
            this.push({t:'v',d:Buffer.concat([this._c,buf.slice(0,index)],this._c.length+index)});
        }
        this._c=buf.slice(index);
        index=0;
        let ndhav=-1;
        if((ndhav=this._c.lastIndexOf(dhav))!==-1){
            assert.ok(ndhav+8===this._c.length);
            this._c=this._c.slice(0,ndhav);
        }

        do{
            let [index2,size2]=DHH264UnPick.findPrefixAndSize(this._c,index+size+1);
            if(index2===-1) {
                if(ndhav===-1){
                    this._c=this._c.slice(index+(this._skip0001?size:0));
                    next();
                    return;
                }
                else{
                    let b=this._c.slice(index+(this._skip0001?size:0));
                    this._c=emptyBuffer;
                    next(null,{t:'v',d:b});
                    return;
                }
            }
            let b=this._c.slice(index+(this._skip0001?size:0),index2);
            this.push({t:'v',d:b});
            index=index2;size=size2;
        }while(true);
    }
}

exports=module.exports=DHH264UnPick;