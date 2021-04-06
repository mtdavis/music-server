const webpack = require('webpack');
const path = require('path');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const PostCompile = require('post-compile-webpack-plugin');
const {execFile} = require('child_process');
const chalk = require('chalk');

const run = (command, args = []) => {
  execFile(command, args, (err, stdout, stderr) => {
    if(err) {
      console.error(chalk.red.bold(`❌ ${command}`));

      if(stdout) {
        console.log(chalk.red(stdout));
      }

      if(stderr) {
        console.error(chalk.red(stderr));
      }
    }
    else if(stdout) {
      console.log(chalk.yellow.bold(`⚠️ ${command}`));
      console.log(chalk.yellow(stdout));
    }
    else {
      console.log(chalk.green.bold(`✅ ${command}`));
    }
  });
}

module.exports = {
  devtool: 'source-map',
  entry: {
    main: './src/main.tsx',
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
    extensions: ['.tsx', '.ts', '.js'],
    modules: [path.resolve(__dirname, './src'), 'node_modules'],
  },
  plugins: [
    new HtmlWebPackPlugin({
      template: 'src/index.html',
      chunks: ['jquery', 'gapless5', 'main'],
      chunksSortMode: 'manual',
      filename: './index.html'
    }),

    new PostCompile(() => {
      run('eslint', ['src']);
    }),

    new PostCompile(() => {
      run('tsc', ['--noEmit']);
    }),
  ],
};
