/**
 * Created by Luky on 2017/11/08.
 */

class Counter{
    constructor(){
        this.ref=0;
    }
    addReference(){
        return ++this.ref;
    }
    get inReference(){
        return 0!==this.ref;
    }
    release(){
        this.ref=Math.max(0,this.ref-1);
        return this.ref===0;
    }

    get count(){
        return this.ref;
    }

}

exports=module.exports=Counter;