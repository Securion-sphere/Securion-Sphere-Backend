export default () => ({
  frontendUrl: 'http://localhost:3000',
  app: {
    port: parseInt(process.env.APP_PORT) || 5000,
  },
});
