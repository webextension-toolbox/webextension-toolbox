const webpack = require('webpack')
const configureWebpack = require('./webpack-config.js')

module.exports = (env) => webpack(configureWebpack(env))
