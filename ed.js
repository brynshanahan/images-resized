const path = require('path')

module.exports = {
  name: 'image-resizer',
  alias: {
    squoosh: path.resolve('./src/lib/squoosh'),
  },
  webpack: config => {
    const babel = config.module.rules.find(x =>
      x.loader.includes('babel-loader')
    )

    babel.options.plugins = babel.options.plugins.map(plugin => {
      if (plugin.includes('plugin-proposal-class-properties')) {
        return [plugin, { loose: true }]
      }
      return plugin
    })

    babel.options.plugins.unshift([
      require.resolve('@babel/plugin-proposal-decorators'),
      { legacy: true },
    ])
  },
}
