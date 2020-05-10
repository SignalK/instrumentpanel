var path = require('path');
var webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  entry: {
    ui: './lib/ui/main.js'
  },
  output: {
    path: path.join(__dirname, 'public'),
    filename: '[name].js',
//    chunkFilename: '[name].js',
    publicPath: './',
    pathinfo: false
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
                ],
                '@babel/preset-flow'
              ],
              plugins: [
                "@babel/plugin-transform-flow-comments",
                "@babel/plugin-proposal-class-properties",
                "@babel/plugin-syntax-dynamic-import"
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
    splitChunks: {
      cacheGroups: {
        default: false,
        vendors: false,
/*
        react: {
          name: 'react',
          chunks: 'all',
          test: /[\\/]node_modules[\\/](react.*)[\\/]/,
          priority: 10
        },
        vendor: {
          name: 'vendor',
          chunks: 'all',
//          test: /node_modules/,
          priority: 20
        },
*/
        common: {
          name: 'common',
          minChunks: 2,
          chunks: 'all',
          priority: 5,
          reuseExistingChunk: true,
          enforce: true
        }
      }
    }
  },
  devtool: 'source-map',
  devServer: {
    contentBase: path.resolve(__dirname, 'public'),
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
    },
    extensions: [".js", ".jsx"]
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.DefinePlugin({
      VERSION: JSON.stringify(require("./package.json").version)
    }),
    new BundleAnalyzerPlugin({analyzerHost: '0.0.0.0'})
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
