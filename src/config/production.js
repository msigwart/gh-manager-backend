import {getSecret} from "../utils/secrets";
import {asyncConfig} from "config/async";

module.exports = {
  database: {
    host: `/cloudsql/${process.env.CLOUD_SQL_CONNECTION_NAME}`,
    password: asyncConfig(getSecret('DB_PASSWORD', 2))
  },
  mail: {
    password: asyncConfig(getSecret('MAIL_PASSWORD', 2))
  },
  app: {
    logLevel: 'debug'
  },
};
