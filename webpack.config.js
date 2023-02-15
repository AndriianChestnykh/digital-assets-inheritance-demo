const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin')

const DIST = path.resolve(__dirname, 'dist')

module.exports = {
  mode: "development",
  entry: './src/index.js',
  devServer: {
    static: {
      directory: DIST
    },
    compress: true,
    port: 9010,
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
          from: 'src/*',
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
