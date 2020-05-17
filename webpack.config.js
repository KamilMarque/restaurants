const CompressionPlugin = require('compression-webpack-plugin');

module.exports = {
    plugins: [
      new CompressionPlugin({
        test: /\.(js|css)$/,
        asset: '[path].gz[query]',
        algorithm: 'gzip',
        deleteOriginalAssets: true
      })
    ]
  }