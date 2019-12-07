const path = require('path');                             // 絶対パスに変換するために
const webpack = require('webpack');
const htmlWebpackPlugin = require('html-webpack-plugin'); // index.htmlをビルドチェインの中で作っちゃう
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');
const workers = ForkTsCheckerWebpackPlugin.ALL_CPUS + 1;
const isProduction = process.env.NODE_ENV === 'prod';
const tsConfigFile = `tsconfig.${isProduction ? 'prod' : 'dev'}.json`;
module.exports = {
    mode: isProduction ? 'production' : 'development',
    entry: './src/index.tsx',  // エントリポイントの指定、src下に書いていくので　src/index.tsxにしとく
    output: {
        filename: 'js/[name].js',// 仕上がりファイルの置き場
        chunkFilename: 'js/[name].bundle.js',
        path: path.resolve(__dirname, 'dist')   // 出力ディレクトリの指定の絶対パス
    },
    optimization: {
        namedChunks: true,
        splitChunks: {
            automaticNameDelimiter: '-',
            cacheGroups: {
                vendors: false
            }
        }
    },
    resolve: {
        extensions: [ '.tsx', '.ts', '.js','.json' ]    // importの時に、これらの拡張子は解決してもらえる、要するにHoge.tsxをimport Hoge from './Hoge'みたいに書ける
    },
    node: {
        fs: 'empty' // for Module not found: Error: Can't resolve 'fs' in 'node_modules\scanf\lib'
    },
    target: 'web',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'thread-loader',
                        options: {
                            workers
                        }
                    },
                    {
                        loader: 'babel-loader?cacheDirectory'
                    },
                    {
                        loader: 'tslint-loader',
                        options: {
                            fix: true,
                            typeCheck: true, // これがないとtslint-config-airbnbが'no-boolean-literal-compare'エラーを出す。
                            emitErrors: true, // これ設定しとくとTSLintが出してくれたwarningをエラーとして扱ってくれる、要するに-Wall
                            tsConfigFile
                        }
                    }
                ]
            },
            {
                test: /\.css$/,
                use: [
                    'style-loader',//cssを<link>タグに展開する
                    'css-loader',//cssをjsにバンドルする
                ],
            },
            {
                test: /\.(gif|png)$/,
                loaders: 'url-loader'
              },
            {
                test: /\.(woff|woff2|eot|ttf|svg)$/,
                loader: 'file-loader?name=./font/[name].[ext]'
            }
        ]
    },
    plugins: [
        new htmlWebpackPlugin({
            template: "src/index.html"    // 同じ階層にあるindex.htmlを元に、デプロイ用のindex.htmlを作って出力ディレクトリに配置してくれる
        }),
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery"
        }),
        new ForkTsCheckerWebpackPlugin({
            // workers: ForkTsCheckerWebpackPlugin.TWO_CPUS_FREE,
            useTypescriptIncrementalApi: true,
            tsconfig: path.resolve(__dirname, tsConfigFile),
            async: false,
            checkSyntacticErrors: true,
            memoryLimit : 4096,
            compilerOptions: {
                skipLibCheck: true
            },
        }),
        new HardSourceWebpackPlugin({
            cacheDirectory: path.resolve(__dirname, 'node_modules/.cache/hard-source/[confighash]')
        })
    ]
};
