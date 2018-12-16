var path = require('path');
var webpack = require('webpack');

module.exports = {
  entry: {
    ui: [
      './lib/ui/main.js'
    ]
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].js',
    publicPath: '/dist/'
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
  resolve: {
    alias: {
      bacon: "baconjs"
    }
  },
  plugins: [
    new webpack.DefinePlugin({
      VERSION: JSON.stringify(require("./package.json").version)
    })
  ],
  externals: ['mdns', 'validator-js', 'ws'],
  mode: 'production'
}
