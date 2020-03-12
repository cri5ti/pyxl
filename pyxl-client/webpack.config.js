const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const Dotenv = require('dotenv-webpack');

module.exports = {
    mode: process.env.NODE_ENV || 'development',
    entry: './src/index.tsx',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'app.js',
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx'],
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: "ts-loader",
                exclude: /node_modules/,
                options: {
                    // configFile,
                    projectReferences: true
                }
            },
            {
                test: /\.scss$/,
                use: [
                    'style-loader',
                    { loader: 'css-loader', options: { modules: 'global', localsConvention: 'camelCaseOnly' } },
                    'sass-loader'
                ]
            }
        ],
    },
    devtool: "source-map",
    devServer: {
        contentBase: path.join(__dirname, 'dist'),
        host: '0.0.0.0',
        port: 9000,
        proxy: {
            '/hub': {
                target: 'ws://localhost:5000',
                ws: true
            },
        }
    },
    plugins: [
        new HtmlWebpackPlugin({ template: './src/index.html' }),
        new Dotenv()
    ],
};