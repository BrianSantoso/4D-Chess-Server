const path = require('path');

// TODO: move entry to /dist/ dir
module.exports = {
  entry: './public/js/main.jsx',
  output: {
    filename: 'bundle-front.js',
    path: path.resolve(__dirname, 'public', 'build'),
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ['babel-loader']
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
        ]
      },
    ]
  }
};