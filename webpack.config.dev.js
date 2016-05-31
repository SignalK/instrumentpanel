var path = require('path');
var webpack = require('webpack');

module.exports = {
  entry: {
    ui: [
      'webpack-dev-server/client?http://localhost:3001/',
      'webpack/hot/only-dev-server',
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
        presets: ['es2015', 'stage-0', 'react', 'react-hmre']
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
