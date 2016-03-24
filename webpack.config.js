var webpack = require('webpack');
var path = require('path');

module.exports = {
  entry: {
    ui: './lib/ui/main.js',
    vendor: ['react', 'debug', 'd3', 'react-bootstrap', 'bluebird', 'baconjs']
  },
  output: {
    path: 'dist',
    filename: '[name].js'
  },
  module: {
    loaders: [
      {test: /\.jsx?$/, exclude: /node_modules/, loader: 'babel'},
      {test: /\.json$/, loader: 'json'}
    ]
  },
  resolve: {
    alias: {
      bacon: "baconjs"
    }
  },
  resolveLoader: { fallback: path.join(__dirname, "node_modules") },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin('vendor', 'vendor.js'),
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)
  ],
 externals: ['mdns']
}
