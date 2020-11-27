const path = require('path');
const nodeExternals = require('webpack-node-externals');
module.exports = {
  target: "node",
  entry: "./testing/PieceBehavior.js",
  output: {
    path: path.resolve(__dirname, "./testing/build"),
    filename: "bundle-testing.js"
  },
  externals: [nodeExternals()],
};