const { defineConfig } = require('@vue/cli-service');

const port = parseInt(process.env.PORT) || 8099;

module.exports = defineConfig({
  chainWebpack: (config) => {
    config.plugin('html').tap((args) => {
      args[0].title = 'Chatooha'
      return args;
    })
  },
  devServer: {
    port,
    allowedHosts: 'all',
    webSocketServer: 'ws',
    client: {
      webSocketURL: 'auto://0.0.0.0:0/ws',
    },
  },
});
