'use strict';

var P = require('../../servers/ipc_video_persistence');
var fs = require('fs');
var _ = require('lodash');
var expect = require('chai').expect;
var path = require('path');
var config = require('../../config/config');

describe('测试持久化地址生成类', function () {
    it('imagefile', function (done) {
        var p = new P({
            pathTempl: '../assets/monitors/{yyyy}{mm}',
            imageTempl: '{dd}-{prefix}',
            videoTempl: '{dd}-{prefix}'
        });
        var image = p.imagePath('abc', 'png');
        var jie = image.split('\\');
        var index = jie.length - 1;
        var date = new Date();
        expect(jie[index--]).equal(date.getDate() + '-abc.png');
        expect(jie[index--]).equal('' + date.getFullYear() + _.padStart('' + (date.getMonth() + 1), 2, 0));
        expect(jie[index--]).equal('monitors');
        expect(jie[index]).equal('logs');
        fs.exists(image.slice(0, -10), function (exists) {
            expect(exists).equal(true);
            done();
        });
    });
    it('videofile', function (done) {
        var p = new P({
            pathTempl: '../assets/monitors/{yyyy}{mm}',
            imageTempl: '{dd}-{prefix}',
            videoTempl: '{dd}-{prefix}'
        });
        var image = p.videoPath('abc', 'flv');
        var jie = image.split('\\');
        var index = jie.length - 1;
        var date = new Date();
        expect(jie[index--]).equal(date.getDate() + '-abc.flv');
        expect(jie[index--]).equal('' + date.getFullYear() + _.padStart('' + (date.getMonth() + 1), 2, 0));
        expect(jie[index--]).equal('monitors');
        expect(jie[index]).equal('logs');
        fs.exists(image.slice(0, -10), function (exists) {
            expect(exists).equal(true);
            done();
        });
    });
    it('videopath', function () {
        var p = new P({
            imageTempl: '{dd}-{prefix}',
            videoTempl: '{dd}-{prefix}'
        });
        var image = p.videoPath('abc', 'flv');
        var ap = path.relative(config.getVideoPath(), image);
        console.log(ap);
    });
});
//# sourceMappingURL=persistence.test.js.map