/**
 * Created by liuyun on 2017/1/18.
 */
var ExtractTextPlugin = require('extract-text-webpack-plugin');

let extractCSS = new ExtractTextPlugin('./index.css');

module.exports = {
    entry: [
        './src/index.js',
        './src/index.less'
    ],
    output: {
        path: './build',
        filename: 'index.js'
    },
    module: {
        loaders: [{
            test: /\.js$/,
            exclude: /node_modules/,
            loader: ['babel'],
            query: {
                presets: ['react','es2015']
            }
        },{
            test: /\.css$/,
            loader: extractCSS.extract('style', 'css'),
        },{
            test: /\.less$/,
            loader: extractCSS.extract('style','css!less'),
        }]
    },
    plugins: [
        extractCSS
    ]
}