const webpack = require('webpack');
const HtmlWebPackPlugin = require('html-webpack-plugin');

module.exports = {
  devtool: 'source-map',
  entry: {
    main: './src/app.tsx',
    jquery: './bower_components/jquery/dist/jquery.min.js',
    gapless5: './bower_components/gapless5/gapless5.js'
  },
  module: {
    rules: [
      {
        test: /\.html$/,
        use: [{loader: 'html-loader', options: {minimize: true}}]
      },
      {
        test: /(\.ts)|(\.tsx)|(\.js)$/,
        use: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /(\.svg$)|(\.eot$)|(\.woff$)|(\.ttf$)/,
        use: 'file-loader'
      },
      {
        test: /(gapless5\.js)|(jquery.min.js)/,
        use: 'script-loader'
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  plugins: [
    new HtmlWebPackPlugin({
      template: 'src/index.html',
      chunks: ['jquery', 'gapless5', 'main'],
      chunksSortMode: 'manual',
      filename: './index.html'
    }),
  ],
};
