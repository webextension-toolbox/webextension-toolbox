const envPlugins = {
  development: [
    require.resolve('@babel/plugin-transform-react-jsx-source')
  ],
  production: [
    require.resolve('babel-plugin-transform-react-remove-prop-types')
  ]
}

const plugins = envPlugins[process.env.NODE_ENV] || envPlugins['development']

module.exports = ({ targets }) => ({
  presets: [
    [require.resolve('@babel/preset-env'), {
      modules: false,
      targets
    }],
    require.resolve('@babel/preset-react')
  ],
  plugins: [
    require.resolve('@babel/plugin-proposal-object-rest-spread'),
    require.resolve('@babel/plugin-proposal-class-properties'),
    require.resolve('@babel/plugin-transform-runtime'),
    ...plugins
  ]
})
