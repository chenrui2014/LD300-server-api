'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Created by Luky on 2017/7/6.
 */

var dh = require('./dahua/dh_ipc');
var onvif = require('./onvif/onvif_ipc');
var _508 = require('./_508/_508_ptz');
var _ = require('lodash');
var integration = require('./base/ipc_Integration');

var AddIn = function () {
    function AddIn() {
        _classCallCheck(this, AddIn);

        this.brand = {};
        /*this.ptz_component={};
        this.video_component={};
        this.audio_component={};
        this.alarm_component={};*/
    }

    _createClass(AddIn, [{
        key: 'regIPCBrand',
        value: function regIPCBrand(brand, name, fnCreateInstance) {
            this.brand[brand] = {
                protocol: brand,
                name: name,
                createInstance: fnCreateInstance
            };
        }
    }, {
        key: 'createInstance',
        value: function createInstance(options) {
            var cls = this.brand[options.brand];
            if (!cls) return null;
            return cls.createInstance(options);
        }
        /*
            regPTZComponent(protocol,name,cls){
                this.ptz_component[protocol]={
                    protocol:protocol,
                    name:name,
                    cls:cls
                };
            }
        
            regVedioComponent(protocol,name,cls){
                this.video_component[protocol]={
                    protocol:protocol,
                    name:name,
                    cls:cls
                };
            }
        
            regAudioComponent(protocol,name,cls){
                this.audio_component[protocol]={
                    protocol:protocol,
                    name:name,
                    cls:cls
                };
            }
        
            regAudioComponent(protocol,name,cls){
                this.alarm_component[protocol]={
                    protocol:protocol,
                    name:name,
                    cls:cls
                };
            }
        
            _getProtocolOf(collect){
                let ret=[];
                _.forEach(collect,(value,key)=>{
                    ret.push({
                        en:key,
                        cn:value.name,
                        protocol:value.protocol
                    });
                });
                return ret;
            }
        
            getBrands(){
                return this._getProtocolOf(this.brand);
            }
        
            getVedioProtocol(){
                return this._getProtocolOf(this.video_component);
            }
        
            getPTZProtocol(){
                return this._getProtocolOf(this.ptz_component);
            }
            getAudioProtocol(){
                return this._getProtocolOf(this.audio_component);
            }*/

    }]);

    return AddIn;
}();

exports = module.exports = new AddIn();

exports.regIPCBrand('dahua', '大华', function (options) {
    return new dh(options);
});
exports.regIPCBrand('hopewell', '和普威尔', function (options) {
    return new onvif(options);
});
exports.regIPCBrand('hikvision', '海康威视', function (options) {
    return new onvif(options);
});
exports.regIPCBrand('508', '国营508集成海康威视', function (options) {
    return integration(onvif, options, _508, _.extend({}, options, options.ptz));
});
exports.regIPCBrand('onvif', 'onvif协议', function (options) {
    return new onvif(options);
});
//exports.regVedioComponent('dahua','大华私有协议',dh);
//exports.regVedioComponent('onvif','onvif标准协议',onvif);
//exports.regPTZComponent('onvif','onvif标准协议',onvif);
//exports.regPTZComponent('dahua','大华转台协议',dh);
//exports.regPTZComponent('508','508长转台协议',_508);
//exports.regAudioComponent('dahua','大华音频对讲协议',dh);
//# sourceMappingURL=ipc_addin.js.map