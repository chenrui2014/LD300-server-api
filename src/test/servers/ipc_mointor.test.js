const M=require('../../app/servers/ipc_mointors');
const expect=require('chai').expect;

let data=[
    {
        id:5,//ipcid
        point:700,//距离
        demo:true,//是否球机
        preset:{"x":1,"y":1,"z":1,preset:'1'}//球机预置点信息
    },
    {
        id:5,//ipcid
        point:900,//距离
        demo:true,//是否球机
        preset:{"x":16,"y":1,"z":1,preset:'1'}//球机预置点信息
    },
    {
        id:5,//ipcid
        point:800,//距离
        demo:true,//是否球机
        preset:{"x":10,"y":1,"z":1,preset:'2'}//球机预置点信息
    },
    {
        id:2,
        point:780,
        demo:false
    },
    {
        id:2,
        point:790,
        demo:false
    }
];

describe('监控测试',()=>{
    let mt=new M(1);
    mt._setMointor(data);
    let m=mt._mointors;
    it('测试数据初始化',()=>{
        expect(!m['5']).equal(false);
        expect(!m['2']).equal(false);
        let m5=m['5'];
        expect(m5.range[0]).equal(700);
        expect(m5.range[1]).equal(900);
        expect(m5.points.length).equal(3);
        expect(m5.points[0].point).equal(m5.range[0]);
        expect(m5.points[1].point).equal(800);
        expect(m5.points[2].point).equal(m5.range[1]);
        expect(m5.id).equal(5);
        expect(m5.demo).equal(true);
    });

    it('范围划定--左',()=>{
        let mx=mt.getMointors(700);
        expect(mx.length).equal(1);
        let mx0=mx[0];
        expect(mx0.id).equal(5);
        expect(mx0.x).equal(1);
    });

    it('范围划定-右',()=>{
        let mx=mt.getMointors(800);
        expect(mx.length).equal(1);
        let mx0=mx[0];
        expect(mx0.id).equal(5);
        expect(mx0.x).equal(10);
    });

    it('球机插值位置计算-中',()=>{
        let mx=mt.getMointors(750);
        expect(mx.length).equal(1);
        let mx0=mx[0];
        expect(mx0.id).equal(5);
        expect(mx0.x>1).equal(true);
        expect(mx0.x<10).equal(true);
    });


});