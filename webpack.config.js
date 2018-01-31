'use strict';

//const webpack = require('webpack');
let path=require('path');
const webpack = require('webpack');
const externals = _externals();

module.exports = {
    entry: {
        index: './src/index.js',
        upgrade:'./src/upgrade.js',
        live:'./src/live.js'
    },
    target: 'node',
    output: {
        path: path.resolve(__dirname,'build'),
        filename: '[name].js'
    },
    resolve: {
        extensions: ['.js']
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                query: {
                    presets: ['es2015','stage-0']
                },
                exclude: /node_modules/
            }
        ]
    },
    externals:[function(context, request, callback) {
        //console.log(request);
        //console.log(externals[request]);
        if(externals[request]) return callback(null, 'commonjs ' + request);
        if (/config$/.test(request)){
            return callback(null, 'commonjs ' + request);
        }
        callback();
    }],
    node: {
        console: true,
        global: true,
        process: true,
        Buffer: true,
        __filename: true,
        __dirname: true,
        setImmediate: true
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin()
    ]
};

function _externals() {
    let mainfest = require('./package.json');
    let dependencies = mainfest.dependencies;
    let externals = {};
    for (let p in dependencies) {
        externals[p] = 'commonjs ' + p;
    }
    //console.log(JSON.stringify(externals));
    return externals;
}