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
	  { // Load svgs: https://www.pluralsight.com/guides/how-to-load-svg-with-react-and-webpack
        test: /\.svg$/,
        use: [
          {
            loader: 'svg-url-loader',
            options: {
              limit: 10000,
            },
          },
        ],
      },
    ]
  }
};