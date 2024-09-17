export default () => ({
  docker: {
    host: process.env.DOCKER_API_HOST,
    api: process.env.DOCKER_API_URL,
  },
});
