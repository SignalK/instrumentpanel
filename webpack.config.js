var path = require('path');
var webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  entry: {
    ui: [
      './lib/ui/main.js'
    ]
  },
  output: {
    path: path.join(__dirname, 'public'),
    filename: '[name].js',
    publicPath: '/public/'
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true,
              presets: ['react', 'env']
            }
          }
      }
    ]
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        cache: true,
        parallel: true,
        sourceMap: true
      }),
    ],
  },
  devtool: 'source-map',
  devServer: {
    contentBase: './public',
    publicPath: '/',
    watchContentBase: true,
    hot: true,
    compress: true,
    port: 3001,
    host: '0.0.0.0',
    index: 'index.html',
    disableHostCheck: true,
    progress: true,
    stats: {
      children: false,
      maxModules: 0
    }
  },
  resolve: {
    alias: {
      bacon: "baconjs"
    }
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.DefinePlugin({
      VERSION: JSON.stringify(require("./package.json").version)
    })
  ],
  stats: {
    children: false,
    maxModules: 0
  },
  performance: {
    hints: false
  },
  mode: 'production'
}
