const path = require('path');

// TODO: move entry to /dist/ dir
module.exports = {
  // Need @babel/polyfill for async/await: https://medium.com/@tanbt/configure-async-await-es7-in-webpack-4-78adfda46eac
  entry: ['@babel/polyfill', './public/js/main.jsx'],
  output: {
    filename: 'bundle-front.js',
    path: path.resolve(__dirname, 'public', 'build'),
    publicPath: '/'
  },
  devServer: {
    historyApiFallback: true,
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
      }
    ]
  }
};