import winston, { format, Logger } from 'winston'
import { Container, Token } from 'typedi'
import { Pool } from 'pg'
import { migrate } from 'postgres-migrations'
import config from 'config'
import { resolveAsyncConfigs } from 'config/async'
import { Sequelize } from 'sequelize-typescript'
import { User } from '../models/user.model'
import { UserSession } from '../models/user-session.model'
import {RepoUser} from "../models/repo-user.model";
import {Repo} from "../models/repo.model";

export const LOGGER = new Token<Logger>('logger')
export const DATABASE = new Token<Sequelize>('database')

export async function initialize() {
  try {
    await resolveAsyncConfigs(config)
    // configure logger
    const logger = winston.createLogger({
      level: config.get('app.logLevel'),
      format: format.combine(format.colorize(), format.simple()),
      transports: [new winston.transports.Console()],
    })
    Container.set(LOGGER, logger)

    // configure database access
    const sequelize = new Sequelize({
      database: config.get('database.database'),
      dialect: 'postgres',
      username: config.get('database.user'),
      password: config.get('database.password'),
      host: config.get('database.host'),
      port: config.get('database.port'),
      logging: (sql) => logger.debug(sql),
      models: [User, UserSession, Repo, RepoUser], // or [Player, Team],
    })
    try {
      await sequelize.authenticate()
      logger.info('Database connection has been established successfully.')
    } catch (error) {
      logger.error('Unable to connect to the database:', error)
      process.exit(1)
    }
    Container.set(DATABASE, sequelize)

    const pool = new Pool(config.get('database'))
    logger.info(
      `Performing migrations (database ${config.get('database.database')})...`
    )
    await migrate(
      {
        client: pool,
      },
      './db/migrations',
      {
        logger: (msg) => logger.info(msg),
      }
    )
    logger.info('Migrations done.')
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}
