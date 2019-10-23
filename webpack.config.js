var path = require('path');
var webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  entry: {
    ui: './lib/ui/main.js'
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
              presets: [
                '@babel/preset-react',
                [
                  '@babel/preset-env',
                  {
// If you want optimize the buid size but reduce compatibility
// you can uncomment one line below. e.g. to produce a version most efficient but only compatible with chrome version 77
//                    targets: { browsers: ['chrome 77'] },
// 'defaults' produce a version for the most common and up-to-date browsers and not dead
//                    targets: { browsers: ['defaults'] },
//                    targets: { browsers: ['defaults', 'not ie 11', 'not ie_mob 11'] },
                    debug: false,
                    useBuiltIns: 'usage',
                    corejs: 3,
                  }
                ]
              ]
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
    },
    watchOptions: {
      aggregateTimeout: 5000
    },
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
