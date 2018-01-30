const P=require('../../servers/ipc_video_persistence');
const fs=require('fs');
const _=require('lodash');
const expect=require('chai').expect;
const path=require('path');
const config=require('../../config/config')

describe('测试持久化地址生成类',()=>{
    it('imagefile',(done)=>{
        let p=new P({
            pathTempl:'../assets/monitors/{yyyy}{mm}',
            imageTempl:'{dd}-{prefix}',
            videoTempl:'{dd}-{prefix}',
        });
        let image=p.imagePath('abc','png');
        let jie=image.split('\\');
        let index=jie.length-1;
        let date=new Date();
        expect(jie[index--]).equal(`${date.getDate()}-abc.png`);
        expect(jie[index--]).equal(`${date.getFullYear()}${_.padStart(''+(date.getMonth()+1),2,0)}`);
        expect(jie[index--]).equal('monitors');
        expect(jie[index]).equal('logs');
        fs.exists(image.slice(0,-10), (exists) => {
            expect(exists).equal(true);
            done();
        });
    });
    it('videofile',(done)=>{
        let p=new P({
            pathTempl:'../assets/monitors/{yyyy}{mm}',
            imageTempl:'{dd}-{prefix}',
            videoTempl:'{dd}-{prefix}',
        });
        let image=p.videoPath('abc','flv');
        let jie=image.split('\\');
        let index=jie.length-1;
        let date=new Date();
        expect(jie[index--]).equal(`${date.getDate()}-abc.flv`);
        expect(jie[index--]).equal(`${date.getFullYear()}${_.padStart(''+(date.getMonth()+1),2,0)}`);
        expect(jie[index--]).equal('monitors');
        expect(jie[index]).equal('logs');
        fs.exists(image.slice(0,-10), (exists) => {
            expect(exists).equal(true);
            done();
        });
    });
    it('videopath',()=>{
        let p=new P({
            imageTempl:'{dd}-{prefix}',
            videoTempl:'{dd}-{prefix}',
        });
        let image=p.videoPath('abc','flv');
        let ap=path.relative(config.getVideoPath(),image);
        console.log(ap);
    });
});