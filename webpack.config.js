const path = require("path");
const CleanWebpackPlugin = require('clean-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');


module.exports = {
    entry: './src/index.jsx',
    output: {
        path: path.join(__dirname, "./public/dist/"),
        filename: 'bundle.js',
//      filename: 'bundle.[hash].js'
    },
    plugins: [
      new CleanWebpackPlugin(['./public/dist']),
      new UglifyJsPlugin({
//        comments: false,
      }),
    ],      
    module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      }
    ]
  }
};
