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
    publicPath: '/'
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
              "@babel/plugin-proposal-class-properties"
            ]
          }
        }
      }
    ]
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        parallel: true,
      }),
    ],
  },
  devtool: 'source-map',
  devServer: {
    static: path.resolve(__dirname, './public'),
    allowedHosts: 'all',
    client: {
      logging: 'info',
      overlay: true,
      progress: true,
    },

    compress: true,
    port: 3001,
    host: '0.0.0.0',
    proxy: [
      {
        context: ['/signalk/', '/skServer/loginStatus',],
        target: 'http://localhost:3000',
      },
      {
        context: ['/signalk/v1/stream',],
        target: 'http://localhost:3000',
        ws: true
      },
    ],
  },
  resolve: {
    alias: {
      bacon: "baconjs"
    },
    extensions: [".js", ".jsx"],
    fallback: {
      "util": require.resolve("util/")
    }
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.DefinePlugin({
      VERSION: JSON.stringify(require("./package.json").version)
    }),
    new webpack.ProvidePlugin({
      process: 'process/browser',
    })
  ],
  stats: {
    children: false,
  },
  performance: {
    hints: false
  },
  mode: 'production'
}
