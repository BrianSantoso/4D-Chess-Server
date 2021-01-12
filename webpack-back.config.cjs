const path = require('path');
const nodeExternals = require('webpack-node-externals');
module.exports = {
  target: "node",
  entry: "./backend/index.js",
  output: {
    path: path.resolve(__dirname, "./backend/build"),
    filename: "bundle-back.js"
  },
  externals: [nodeExternals()],
};