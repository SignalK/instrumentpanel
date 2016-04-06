var webpack = require('webpack')

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
      {test: /\.js?$/, exclude: /node_modules/, loader: 'babel', query:{"presets":['react']}},
      {test: /\.json$/, loader: 'json-loader'}
    ]
  },
  resolve: {
    alias: {
      bacon: "baconjs"
    }
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin('vendor', 'vendor.js'),
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)
  ]
}
