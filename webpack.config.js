let path = require('path');

module.exports = {
  entry: './examples/entry.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'examples/build'), // Change with your assets directory where it should build (and filename)
  },
  devtool: 'source-map',
  module: {
    rules: [
      // Compiles javascript (ES6) files to compatible
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader'
          // options: {
          //   // I am just guessing your presets here :P
          //   presets: ['env', '@babel/preset-react'],
          //   plugins: ['@babel/plugin-proposal-class-properties', '@babel/plugin-proposal-object-rest-spread'],
          // }
        }
      }
    ]
  }
}