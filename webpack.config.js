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
    loaders: [{
      test: /\.jsx?$/,
      exclude: /node_modules/,
      loaders: ['react-hot', 'babel']
    },{
      test: /\.json$/,
      loader: 'json'
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
    new webpack.NoErrorsPlugin(),
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)
  ],
  externals: ['mdns', 'validator-js', 'ws']
}
