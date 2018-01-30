
/**
 * Created by Luky on 2017/9/4.
 */
const config=global.server_config||require('../config/config');
const root=config.root;
const _=require('lodash');
const mkdirp=require('mkdirp');
const path = require('path');
const stringFormat=require('string-template');

class Persistence{
    constructor(options){
        this.options={
            pathTempl:'../assets/monitors/{yyyy}{mm}',
            imageTempl:'{dd}-{hh}{mi}{ss}-{iter}-{prefix}',
            videoTempl:'{dd}-{hh}{mi}{ss}-{prefix}',
        };
        _.extend(this.options,_.get(config,'persistence',null),options);
        this._index=0;
    }

    _unTemplate(template,prefix){
        let date=new Date();
        if(template.indexOf('{iter}')>-1){
            this._index++;
        }
        return stringFormat(template,{
            'prefix':prefix,
            'yy':date.getFullYear()%100,
            'yyyy':date.getFullYear(),
            'mm':_.padStart(''+(date.getMonth()+1),2,0) ,
            'dd':_.padStart(''+date.getDate(),2,0),
            'hh':_.padStart(''+date.getHours(),2,0),
            'mi':_.padStart(''+date.getMinutes(),2,0),
            'ss':_.padStart(''+date.getSeconds(),2,0),
            'iter':_.padStart(''+this._index,3,0)
        });
    }

    get _path(){
        if(this.__path){
            return this.__path;
        }
        let ret=path.resolve(root,this._unTemplate(this.options.pathTempl));
        mkdirp.sync(ret);
        return this.__path=ret;
    }

    imagePath(prefix='',postfix='jpg'){
        return path.resolve(this._path,this._unTemplate(this.options.imageTempl,prefix))+'.'+postfix;
    }

    videoPath(prefix='',postfix='flv'){
        return path.resolve(this._path,this._unTemplate(this.options.videoTempl,prefix))+'.'+postfix;
    }
}

exports=module.exports=Persistence;