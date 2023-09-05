const path = require("path");
const HtmlWebPackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: "./src/index.js",
  output: {
    path: path.join(__dirname, "build"),
    filename: "app.js",
  },
  mode: process.env.NODE_ENV,
  optimization: {
    minimize: false,
  },
  devServer: {
    hot: true,
    static: {
      directory: path.join(__dirname, "build"),
    },
    compress: true,
    port: 9000,
  },
  module: {
    rules: [
      {
        test: /\.ts|.tsx$/,
        loader: "ts-loader",
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: "style-loader",
          },
          {
            loader: "css-loader",
          },
        ],
      },
      {
        test: /\.(gif|png|jpe?g|svg|mov)$/i,
        use: [
          "file-loader",
          {
            loader: "image-webpack-loader",
            options: {
              disable: true,
              webp: {
                preset: "picture",
                quality: 90,
                alphaQuality: 90,
                method: 6,
                metadata: "none",
              },
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebPackPlugin({
      template: "./src/index.html",
    }),
  ],
  resolve: {
    extensions: [".ts", ".js", ".jsx", ".tsx", ".jpg", ".png"],
  },
};
