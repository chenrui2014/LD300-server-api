/**
 * Created by Luky on 2017/7/5.
 */
// enum { 'G711', 'G726', 'AAC' }

class Audio{
    get config(){throw new Error('未实现函数config');};
    get isConnected(){throw new Error('未实现函数isConnect');}
    connect(){throw new Error('未实现函数connect');}
    disConnect(){throw new Error('未实现函数DisConnect');}
    startTalk(){throw new Error('未实现函数talk');}
    stopTalk(){throw new Error('未实现函数stopTalk');}
    setTalkData(data,size){throw new Error('未实现函数setTalkData');}
    setVolume(pt){throw new Error('未实现函数setVolume');}
}

exports=module.exports=Audio;
