const path = require('path');

module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },
    mode: 'development',
    devServer: {
        static: './dist',
        proxy: [
            {
                context: ['/linkedin-oauth'],
                target: 'https://www.linkedin.com',
                changeOrigin: true,
                pathRewrite: { '^/linkedin-oauth': '/oauth/v2' },
                secure: false
            },
            {
                context: ['/linkedin-api'],
                target: 'https://api.linkedin.com',
                changeOrigin: true,
                pathRewrite: { '^/linkedin-api': '/v2' },
                secure: false
            }
        ]
    },
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.m?js$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            }
        ],
    },
};
