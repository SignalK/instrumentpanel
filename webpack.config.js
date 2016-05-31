var path = require('path');
var webpack = require('webpack');

module.exports = {
  entry: {
    ui: [
      './lib/main.js'
    ]
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].js',
    publicPath: '/dist/'
  },
  module: {
    loaders: [{
      test: /\.jsx?$/,
      exclude: /node_modules/,
      loader: 'babel',
      query: {
        presets: ['es2015', 'stage-0', 'react']
      }
    },{
      test: /\.json$/,
      loader: 'json'
    },{
      test: /\.txt$/,
      loader: 'ignore-loader'
    }]
  },
  resolve: {
    alias: {
      bacon: "baconjs"
    }
  },
  resolveLoader: { fallback: path.join(__dirname, "node_modules") },
  plugins: [
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    new webpack.NoErrorsPlugin()
  ],
  externals: ['mdns']
}
