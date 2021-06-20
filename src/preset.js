const browserslist = require('browserslist')

module.exports = ({ vendor, vendorVersion }) => {
  const env = process.env.BABEL_ENV || process.env.NODE_ENV
  const isProduction = env === 'production'
  const targets = {}
  targets[vendor] = vendorVersion || latest(vendor)
  return {
    presets: [
      // Latest stable ECMAScript features
      [require('@babel/preset-env').default, {
        // `entry` transforms `@babel/polyfill` into individual requires for
        // the targeted browsers. This is safer than `usage` which performs
        // static code analysis to determine what's required.
        // This is probably a fine default to help trim down bundles when
        // end-users inevitably import '@babel/polyfill'.
        useBuiltIns: 'entry',
        corejs: { version: '3.15' },
        // Do not transform modules to CJS
        modules: false,
        // Restrict to current vendor
        targets
      }],
      [
        require('@babel/preset-react').default,
        {
          // Adds component stack to warning messages
          // Adds __self attribute to JSX which React will use for some warnings
          development: !isProduction
        }
      ]
    ],
    plugins: [
      // Necessary to include regardless of the environment because
      // in practice some other transforms (such as object-rest-spread)
      // don't work without it: https://github.com/babel/babel/issues/7215
      require('@babel/plugin-transform-destructuring').default,
      // class { handleClick = () => { } }
      require('@babel/plugin-proposal-class-properties').default,
      // The following two plugins use Object.assign directly, instead of Babel's
      // extends helper. Note that this assumes `Object.assign` is available.
      // { ...todo, completed: true }
      [
        require('@babel/plugin-proposal-object-rest-spread').default,
        {
          useBuiltIns: true
        }
      ],
      // Transforms JSX
      [
        require('@babel/plugin-transform-react-jsx').default,
        {
          useBuiltIns: true
        }
      ],
      // Polyfills the runtime needed for async/await and generators
      [
        require('@babel/plugin-transform-runtime').default,
        {
          helpers: false,
          regenerator: true
        }
      ],
      // Remove PropTypes from production build
      isProduction && [require.resolve('babel-plugin-transform-react-remove-prop-types'), {
        removeImport: true
      }]
    ].filter(Boolean)
  }
}

/**
 * Returns the latest
 * vendor version
 * @param {String} vendor
 * @return {Number} version
 */
function latest (vendor) {
  const { versions } = browserslist.data[vendor]
  return versions[versions.length - 1]
}
