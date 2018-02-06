'use strict';

var crypto = require('crypto');
var fs = require('fs');

exports.genHash = function (value) {
    if (typeof value === 'string') {
        return crypto.createHash('md5').update(value).digest('hex');
    }
};

exports.readFile = function (path, options) {
    var chunks = [];
    var size = 0;
    return new Promise(function (resolve, reject) {
        var readStream = fs.createReadStream(path, options);

        readStream.on('data', function (chunk) {
            console.log(size);
            chunks.push[chunk];
            size += chunk.length;
        });

        readStream.on('end', function () {
            var buffer = Buffer.concat(chunks, size);
            resolve(buffer);
        });

        readStream.on('error', function (err) {
            reject(err);
        });
    });
};
//# sourceMappingURL=index.js.map