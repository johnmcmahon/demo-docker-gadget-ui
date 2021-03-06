'use strict'

const path = require('path')
const webpack = require('webpack')
const HtmlPlugin = require('html-webpack-plugin')
const pkg = require('./package.json')
const {execSync} = require('child_process')


const {
    NODE_ENV = 'development',
    COMPILER_TARGET = NODE_ENV === 'production' ? 'es5' : 'es2017',
    GIT_REV = execSync('git rev-parse HEAD 2>/dev/null || echo -').toString().trim(),
} = process.env


module.exports = {
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'tslint-loader',
                enforce: 'pre',
                exclude: /node_modules/,
            },
            {
                test: /\.tsx?$/,
                loader: 'awesome-typescript-loader',
                options: {
                    target: COMPILER_TARGET,
                },
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.less$/,
                use: [
                    'style-loader',
                    {
                        loader: 'css-loader',
                        options: {
                            modules: true,
                            importLoaders: 1,
                            localIdentName: '[name]___[local]___[hash:base64:5]',
                        },
                    },
                    'less-loader',
                ],
            },
            {
                test: /\.(png|jpg|gif|ttf|((eot|svg|woff2?)(\?.*)?))$/,
                loader: 'file-loader',
            },
        ],
    },



    devServer: {
        proxy: {
            '/api':      'http://localhost',
            '/basemaps': 'http://localhost',
            '/wms':      'http://localhost',
        },
        historyApiFallback: true,
    },



    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(NODE_ENV),
        }),
        new HtmlPlugin({
            template: 'src/index.html',
            favicon: `src/images/favicon${NODE_ENV === 'production' ? '' : '-dev'}.png`,
            hash: true,
            xhtml: true,
            app: {
                name: pkg.name,
                version: pkg.version,
                revision: GIT_REV,
            },
        }),
    ],

    devtool: 'cheap-module-source-map',

    context: __dirname,
    entry: './src/main.tsx',
    output: {
        filename: 'build.js',
        path: path.join(__dirname, 'dist/public'),
    },

    resolve: {
        extensions: [".ts", ".tsx", '.js'],
    },
}

if (NODE_ENV === 'production') {
    module.exports.devtool = 'source-map'
    module.exports.plugins.push(new webpack.optimize.UglifyJsPlugin({ sourceMap: true }))
}
