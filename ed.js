const path = require('path')

module.exports = {
  name: 'images-resized',
  alias: {
    squoosh: path.resolve('./src/lib/squoosh'),
    src: path.resolve('./src'),
  },
  isModule: true,
  webpack: (config, webpack) => {
    const babel = config.module.rules.find(x =>
      x.loader.includes('babel-loader')
    )

    const codecsRegex = /(\\|\/)codecs(\\|\/).*\.js$/

    babel.options.ignore.push(codecsRegex)
    babel.options.plugins = babel.options.plugins.map(plugin => {
      if (plugin.includes('plugin-proposal-class-properties')) {
        return [plugin, { loose: true }]
      }
      return plugin
    })

    /* Add to start */
    babel.options.plugins.unshift([
      require.resolve('@babel/plugin-proposal-decorators'),
      { legacy: true },
    ])

    config.module.rules.unshift({
      test: codecsRegex,
      use: { loader: require.resolve('exports-loader') },
    })

    // Turn off various NodeJS environment polyfills Webpack adds to bundles.
    // They're supposed to be added only when used, but the heuristic is loose
    // (eg: existence of a variable called setImmedaite in any scope)
    config.node = {
      console: false,
      // Keep global, it's just an alias of window and used by many third party modules:
      global: true,
      // Turn off process to avoid bundling a nextTick implementation:
      process: false,
      // Inline __filename and __dirname values:
      __filename: 'mock',
      __dirname: 'mock',
      // Never embed a portable implementation of Node's Buffer module:
      Buffer: false,
      // Never embed a setImmediate implementation:
      setImmediate: false,
    }

    config.plugins.unshift(
      new webpack.IgnorePlugin(
        /(fs|crypto|path)/,
        new RegExp(`\\${path.sep}codecs\\${path.sep}`)
      )
    )
    // console.log(config.module.rules)
    // process.exit()
  },
}
