const merge = require('webpack-merge');
const baseConfig = require('./webpack.config.js');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = merge(baseConfig, {
    devtool: 'inline-source-map',    // デバッグできるように
    plugins: [
        new BundleAnalyzerPlugin()
    ]
});