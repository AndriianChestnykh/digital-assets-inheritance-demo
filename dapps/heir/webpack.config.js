const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin')

const DIST = path.resolve(__dirname, 'dist')

module.exports = {
  mode: "development",
  entry: path.resolve(__dirname, 'src/index.js'),
  devServer: {
    static: {
      directory: DIST
    },
    compress: true,
    port: 9020,
  },
  output: {
    filename: 'bundle.js',
    path: DIST,
    clean: true,
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'src/*'),
          to: path.resolve(DIST, "[name][ext]"),
          globOptions: {
            ignore: ['**/*.js'],
          }
        }
      ]
    }),
    new NodePolyfillPlugin()
  ]
};
