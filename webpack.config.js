/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */
/* global __dirname */

const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');

module.exports = (env) => {
  return {
    mode: env.production === 'true' ? 'production' : 'development',
    entry: {
      game: path.resolve(__dirname, 'src', 'index.ts'),
      'service-worker': path.resolve(__dirname, 'src', 'service-worker.ts'),
    },
    output: {
      path: path.resolve(__dirname, 'build'),
      filename: '[name].js',
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          loader: 'ts-loader',
        },
      ],
    },
    resolve: {
      extensions: ['.js', '.ts'],
    },
    plugins: [
      new CleanWebpackPlugin(),
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, 'public', 'index.html'),
      }),
      new CopyPlugin({
        patterns: [
          {
            // Style
            from: path.resolve(__dirname, 'public', 'style.css'),
            to: path.resolve(__dirname, 'build'),
          },
          {
            // Favicon
            from: path.resolve(__dirname, 'public', 'favicon.ico'),
            to: path.resolve(__dirname, 'build'),
          },
          {
            // Images
            from: path.resolve(__dirname, 'public', 'images'),
            to: path.resolve(__dirname, 'build', 'images'),
          },
          {
            // Fronts
            from: path.resolve(__dirname, 'public', 'fonts'),
            to: path.resolve(__dirname, 'build', 'fonts'),
          },
          {
            // Sound
            from: path.resolve(__dirname, 'public', 'sounds'),
            to: path.resolve(__dirname, 'build', 'sounds'),
          },
          {
            // Manifest
            from: path.resolve(__dirname, 'public', 'manifest.json'),
            to: path.resolve(__dirname, 'build'),
          },
        ],
      }),
      new webpack.EnvironmentPlugin({
        PHASER_DEBUG: env['phaser-debug'] === 'true',
      }),
    ],
  };
};
