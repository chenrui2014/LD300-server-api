const expect = require('chai').expect;
const Com=require('../../app/serialport/serialport');
const SerialPort=Com;
const _=require('lodash');
console.log('\r测试前通过虚拟串口工具打开端口1和2，并保证无端口13\r');

function error(done){
    expect(1).equal(0);
    done();
}

function ok(done) {
    done();
}

function  toPort(id) {
    return `\\\\.\\COM${id}`;
}

let options={
    baudRate: 115200,
    stopBits: 2,
    dataBits: 8,
    parity:"none",
    byteLength:16,
    tryTimes:0
};

describe('串口测试',()=>{
    describe('com错误测试',()=>{
        it('无法找到端口',(done)=>{
            //File not found
            let com=new Com(13,options);
            com.on('error',(msg)=>{
                expect(msg.innerError.indexOf('File not found')>-1).equal(true);
                expect(msg.errorType).equal(SerialPort.Errors.openError);
            });
            com.connect().then(error.bind(null,done)).catch(ok.bind(null,done));
        });

        it('重复绑定端口',(done)=>{
            //Error: Opening \\\\.\\COM2: Access denied
            let com1=new Com(1,options);
            com1.connect().then(()=>{
                let com=new Com(1,options);
                com.on('error',(msg)=>{
                    expect(msg.innerError.indexOf('Access denied')>-1).equal(true);
                    expect(msg.errorType).equal(SerialPort.Errors.openError);
                });
                com.connect().catch((err)=>{
                    expect(JSON.stringify(err).indexOf('端口以被其他应用占用，请确认')>-1).equal(true);
                    com1.disConnect().then(done).catch(error.bind(null,done));
                });
            }).catch(error.bind(null,done));
        });

        it('一直重连',(done)=>{
            let com=new Com(13,_.extend({},options,{tryTimes:-1}));
            com.connect().then().catch((e)=>{
                expect(e.times).equal(2);
                ok(done);
            });

            let err=0;
            com.on(Com.Events.Offline,(e)=>{
                expect('duration' in e).equal(true);
                err++;
                if(err!==2) return;
                expect(e.times).equal(2);
                com.stopReConnect();
            });
        });
    });

    describe('正常测试',()=>{
        let com=null,com2=null;
        beforeEach((done)=>{
            com=new Com(1,options);
            com.on('error',console.error);
            com.connect().then(()=>{
                com2=new Com(2,options);
                com2.on('error',console.error);
                com2.connect().then(done).catch(error.bind(null,done));
            }).catch(error.bind(null,done));
        });
        it('端口正确关闭',(done)=>{
            com.disConnect().then(()=>{
                com=new Com(1,options);
                com.connect().then(()=>{
                    com.disConnect().then(ok.bind(null,done)).catch(error.bind(null,done));
                }).catch(error.bind(null,done));
            }).catch(error.bind(null,done));
        });

        it('发送获取数据',(done)=>{
            //00000000000000003333551500000000
            com.on('data',(data)=>{
                //const {id,data}=unpackageData(data1);
                expect(data.toString('hex')).equal('00000000000000003333551500000000');
                done();
            });
            com2.write(Buffer.from('00000000000000003333551500000000','hex'));
            setTimeout(()=>{
                done;
            },5000);
        });

        afterEach((done)=>{
            com.disConnect().then(()=>{
                com2.disConnect().then(ok.bind(null,done)).catch(error.bind(null,done));
            }).catch(error.bind(null,done));
        })
    });

    describe('事件测试',()=>{

        function eventDataExpect(data,port,type) {
            expect(data.port).equal(toPort(port));
            expect(data.type).equal(type);
        }

       it('open',(done)=>{
           let com=new Com(1,options);
           com.on(Com.Events.Open,(data)=>{
               eventDataExpect(data,1,Com.Events.Open);
               com.disConnect().then(ok.bind(null,done)).catch(error.bind(null,done));
           });
       });

        it('close',(done)=>{
            let com=new Com(1,options);
            com.on(Com.Events.Close,(data)=>{
                eventDataExpect(data,1,Com.Events.Close);
                done();
            });
            com.disConnect().catch();
        });
    });

    describe('正常测试-去重',()=> {
        let com = null,com2=null;
        beforeEach((done) => {
            let opt=_.extend({},options,{deDuplication:true});
            com = new Com(1,opt);
            com.on('error',console.error);
            com.connect().then(()=>{
                com2=new Com(2,opt);
                com2.on('error',console.error);
                com2.connect().then(done).catch(error.bind(null,done));
            }).catch(error.bind(null, done));
        });

        it('1',(done)=>{
            //00000000000000003333551500000000
            let ct=0;
            com.on('data',(data)=>{
                //const {id,data}=unpackageData(data1);
                expect(data.toString('hex')).equal('00000000000000003333551500000000');
                //expect(id).equal(1);
                ct++;
            });
            for(let i=0;i<3;i++){
                com2.write(Buffer.from('00000000000000003333551500000000','hex'));
            }
            setTimeout(()=>{
                expect(ct===1).equal(true);
                com.disConnect().then(done).catch(error.bind(null,done));
            },10000);
        });
        afterEach((done)=>{
            com.disConnect().then(()=>{
                com2.disConnect().then(ok.bind(null,done)).catch(error.bind(null,done));
            }).catch(error.bind(null,done));
        })
    });
});