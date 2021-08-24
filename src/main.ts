process.env.NODE_CONFIG_DIR = './build/config/' // must be first line
import 'reflect-metadata'
import express, { Response } from 'express'
import { initialize, LOGGER } from './config'
import { Container } from 'typedi'
import config from 'config'
import { log } from './middleware/logger.middleware'
import { errorHandler } from './middleware/error.middleware'
import { authApi } from './routes/auth.route'
import { reposApi } from './routes/repos.route'
import { NotFoundError, RESOURCE_NOT_FOUND_ERROR } from './errors'
import cors from 'cors'

initialize().then(() => {
  const logger = Container.get(LOGGER)
  const app = express()
  const port = <number>config.get('app.port')
  const env = process.env.NODE_ENV || 'development'
  app.use(express.urlencoded({ extended: false }))
  app.use(express.json({ limit: '1mb' }))
  app.use(log)
  app.use(cors())
  app.use('/auth', authApi)
  app.use('/repos', reposApi)
  app.all('*', (req, res: Response, next) => {
    next(new NotFoundError(RESOURCE_NOT_FOUND_ERROR, 'resource does not exist'))
  })
  app.use(errorHandler)
  app.listen(port, () => logger.info(`Running on port ${port} (${env})`))
})
