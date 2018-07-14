const webpack = require('webpack');
const path = require('path');
const del = require('del');

const dtsDir = path.resolve(path.dirname(require.resolve('eonasdan-bootstrap-datetimepicker')));
del.sync(`${dtsDir}/../../node_modules/**`);

module.exports = {
  devtool: 'source-map',
  context: __dirname,
  entry: {
    client: ['core-js/shim', './src/client/index.js'],
    calendar: ['core-js/shim', './src/calendar/index.js'],
  },
  output: {
    path: path.join(__dirname, './build/bundles'),
    filename: '[name].js',
  },
  externals: {
    jquery: 'jQuery',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            query: {
              presets: [
                ['es2015', { modules: false }],
              ],
              plugins: [
                ['transform-runtime', {
                  polyfill: false,
                  regenerator: false,
                }],
              ],
            },
          },
        ],
      },
      {
        test: /\.js$/,
        include: /node_modules/,
        use: './removeAMD',
      },
    ],
  },
  plugins: [
    new webpack.IgnorePlugin(/^\.\/(locale|lang)$/, /(moment|fullcalendar)$/),
  ],
};
