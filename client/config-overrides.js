module.exports = function override(config) {
  // disable html-webpack-plugin script evaluation
  config.plugins.forEach(plugin => {
    if (plugin.constructor.name === 'HtmlWebpackPlugin') {
      plugin.options.scriptLoading = 'blocking';
      plugin.options.minify = false;
    }
  });

  return config;
};
