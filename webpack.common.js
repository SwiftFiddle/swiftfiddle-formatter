const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebbackPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: {
    index: "./Public/index.js",
  },
  output: {
    globalObject: "self",
    filename: "[name].[contenthash].js",
    path: path.resolve(__dirname, "Public/dist"),
    publicPath: "/",
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          {
            loader: "css-loader",
            options: {
              url: false,
              sourceMap: true,
              importLoaders: 2,
            },
          },
          {
            loader: "postcss-loader",
            options: {
              sourceMap: true,
              postcssOptions: {
                plugins: ["autoprefixer"],
              },
            },
          },
          {
            loader: "sass-loader",
            options: {
              sourceMap: true,
            },
          },
        ],
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: "asset/resource",
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "./style.css",
    }),
    new HtmlWebpackPlugin({
      chunks: ["index"],
      filename: "index.leaf",
      template: "./Public/index.leaf",
    }),
    new CopyWebbackPlugin({
      patterns: [
        { from: "./Public/images", to: "images" },
        { from: "./Public/favicons", to: "favicons" },
        { from: "./Public/apple-touch-icon.png", to: "apple-touch-icon.png" },
        { from: "./Public/favicon.ico", to: "favicon.ico" },
        { from: "./Public/error.leaf", to: "error.leaf" },
      ],
    }),
  ],
  optimization: {
    splitChunks: {
      cacheGroups: {
        codemirror: {
          test: /[\\/]codemirror[\\/]/,
          chunks: "initial",
          name: "codemirror",
        },
      },
    },
  },
};
