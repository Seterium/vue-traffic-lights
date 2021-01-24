module.exports = {
  configureWebpack: {
    devServer: {
      port: 3000
    }
  },
  productionSourceMap: process.env.NODE_ENV !== 'production'
}