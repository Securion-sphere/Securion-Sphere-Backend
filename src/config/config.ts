export default () => ({
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  app: {
    port: parseInt(process.env.APP_PORT) || 5000,
  },
});
