const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const SOURCE_PATH = path.resolve(__dirname, 'src');
const PUBLIC_PATH = path.resolve(__dirname, 'public');

module.exports = {
    mode: 'development',
    name: 'dev',
    entry: SOURCE_PATH,
    resolve: { extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'] },
    module: {
        rules: [
            { test: /\.(ts)x?$/, use: ['babel-loader', 'ts-loader'], exclude: /node_modules/ },
            { test: /\.s[ac]ss$/i, use: ['style-loader', 'css-loader', "sass-loader"] }
        ],
    },
    plugins: [ new HtmlWebpackPlugin({ template: path.join(PUBLIC_PATH, 'index.html') }) ],
    devtool: 'source-map',
    devServer: { port: 1996, open: true }
};