const VirtualHost=require('../../host/virtual_host');
const _=require('lodash');

function run(ports,done) {
    _.forEach(ports,(port)=>{
        let vh=new VirtualHost(port);
/*        vh.on('reset',()=>{
            setTimeout(()=>{
                vh.send(VirtualHost.CMD.alarm,10);
            },2000);
        });*/
/*        vh.start().then(()=>{
            vh.send(VirtualHost.CMD.normal);
            setTimeout(()=>{
                vh.send(VirtualHost.CMD.alarm,10);
            },5000);
        }).catch(done);*/
        vh.start().then(()=>{
            let l=()=>{
                vh.send(VirtualHost.CMD.normal);
               /* setTimeout(()=>{
                    vh.send(VirtualHost.CMD.alarm,10);
                    //setTimeout(l,3000);
                },3000);*/
            };
            l();
        }).catch(done);
    });
    setInterval(()=>{
        done;
    },2000033);
}

describe('xxx',()=>{
    it('启动一台主机',(done)=>{
        run([1],done);
    });
    it('启动两台主机，并同一时间报警统一位置',(done)=>{
        run([1,3],done);
    });

    it('启动四台主机，并同一时间报警统一位置',(done)=>{
        run([2,4,6,8],done);
    });
});