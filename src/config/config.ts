export default () => ({
  app: {
    port: parseInt(process.env.APP_PORT) || 5000,
  },
});
