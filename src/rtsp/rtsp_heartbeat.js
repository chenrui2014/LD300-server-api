/**
 * Created by Luky on 2017/7/17.
 */
const EventEmitter=require('events').EventEmitter;
const net = require("net");
const url=require('url');
const WWW_AUTH_REGEX = new RegExp('[\s,]([a-z]+)=([^,\s]+)');
const { createHash } = require("crypto");
const _=require('lodash');

class HeartBeat extends EventEmitter{
    constructor(uri,user,pwd){
        super();
        this.uri=uri;
        this.user=user;
        this.pwd=pwd;
        this.isConnected=false;
        this._cSeq=0;
        this.headers={ 'User-Agent':'lambda/1.0.0'};
    }

    sendRequest(requestName,headers){
        headers=headers||{};
        const id = ++this._cSeq;
        // mutable via string addition
        let req = `${requestName} ${this.uri} RTSP/1.0\r\nCSeq: ${id}\r\n`;

        Object.assign(headers, this.headers);

        Object.keys(headers).forEach((header) => {
            req += `${header}: ${headers[header].toString()}\r\n`;
        });

        this.client.write(req + '\r\n');
    }

    sendOPTIONS(){
        this.sendRequest('OPTIONS');
    }

    sendAuth(headers){
        const auth=headers["WWW-Authenticate"];
        const type =auth.split(" ")[0];
        const authHeaders = {};
        _.each(auth.slice(type.length+1).split(','),(prot)=>{
            let index=prot.indexOf('=');
            authHeaders[_.trim(prot.slice(0,index),'\'"')]=_.trim(prot.slice(index+1),'\'"');
        });

        // mutable, but only assigned to by if block
        let authString = "";
        if (type === "Digest") {
            // Digest Authentication
            const ha1 = getMD5Hash(`${this.user}:${authHeaders.realm}:${this.pwd}`);
            const ha2 = getMD5Hash(`${'OPTIONS'}:${this.uri}`);
            const ha3 = getMD5Hash(`${ha1}:${authHeaders.nonce}:${ha2}`);

            authString = `Digest username="${this.user}",realm="${authHeaders.realm}",nonce="${authHeaders.nonce}",uri="${this.uri}",response="${ha3}"`;
        } else if (type === "Basic") {
            // Basic Authentication
            // https://xkcd.com/538/
            authString = 'Basic ' + new Buffer(`${this.user}:${this.pwd}`).toString('base64');
        }
        this.sendRequest('OPTIONS',Object.assign(headers, { Authorization: authString }));
    }

    _onData(data){
        const [statusCode,CSeq,r]=responseToObject(data.toString('utf8'));
        if(statusCode===401){
            //未授权
            return this.sendAuth(r);
        }
        this.emit('Alive');
        if(this._continue) setTimeout(this.sendOPTIONS.bind(this),1500);
    }

    _onError(e){
        this.emit('Offline',e);
        this.stopListen();
        setTimeout(()=>{
            this.listen();
        },2000);
    }

    listen(){
        const {hostname,port}=url.parse(this.uri);
        let client=net.connect(port||554,hostname,()=>{
            this.isConnected=true;
            this.client = client;
            this.sendOPTIONS();
        });
        client.on("data", this._onData.bind(this));
        client.on("error", this._onError.bind(this));
        //client.on("close", this._onClose.bind(this));
        this._continue=true;
    }

    stopListen(){
        this._continue=false;
        this.client.removeAllListeners();
        this.client.close();
        delete this.client;
    }
}

function getMD5Hash(str) {
    const md5 = createHash("md5");
    md5.update(str);
    return md5.digest("hex");
}

function responseToObject(str){
    const statusCode = parseInt(str.split(' ')[1]);
    const lines=str.split('\r');
    let CSeq=-1;
    let ret={};
    for(let i=1;i<lines.length;i++){
        let linei=lines[i];
        let m=linei.indexOf(':');
        if(-1===m) break;
        let key=linei.slice(0,m).trim(),val=linei.slice(m+1).trim();
        if(key.toLowerCase()==='cseq') {
            CSeq=val;
            continue;
        }
        ret[key]=val;
    }
    return [statusCode,CSeq,ret];
}

exports=module.exports=HeartBeat;
