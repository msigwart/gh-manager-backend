module.exports = {
  database: {
    host: `/cloudsql/${process.env.CLOUD_SQL_CONNECTION_NAME}`,
    password: process.env.DB_PASSWORD,
  },
  github: {
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
  },
  app: {
    domain: process.env.DOMAIN,
    logLevel: 'debug',
  },
}
