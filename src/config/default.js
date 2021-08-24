module.exports = {
  database: {
    database: 'gh-manager',
    user: 'postgres',
    password: undefined, // provided by env or secret
    host: 'localhost',
    port: 5432,
  },
  app: {
    port: process.env.PORT || 8080,
    logLevel: 'debug',
    maxConcurrentSessions: 3,
    domain: 'http://localhost:3000',
  },
  github: {
    clientId: 'c46adb28fb31b483b25f',
    clientSecret: undefined, // provided by env or secret
  },
}
