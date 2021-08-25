import express from 'express'
import { requiresAuth } from '../middleware/auth.middleware'
import { Container } from 'typedi'
import { LOGGER } from '../config'
import { RepoService } from '../services/repo.service'
import { User } from '../models/user.model'
import { ForbiddenError, SYNC_NOT_ALLOWED_ERROR } from '../errors'

export const adminApi = express.Router()

adminApi.get('/sync', requiresAuth, async (req, res, next) => {
  try {
    const logger = Container.get(LOGGER)
    if (!req.context.user.isAdmin) {
      throw new ForbiddenError(
        SYNC_NOT_ALLOWED_ERROR,
        'Only admins are allowed to sync data'
      )
    }
    ;(async () => {
      logger.info('Data sync - start')
      const repoService = Container.get(RepoService)
      const users = await User.findAll()
      for (const user of users) {
        try {
          logger.info(`Syncing data for user ${user.username}...`)
          await repoService.refreshReposOfUser(user)
        } catch (e) {
          logger.warn(`Failed to sync data for user ${user.username}`)
        }
      }
      logger.info('Data sync - end')
    })().catch((e) => logger.warn(e))

    res.status(204).send()
  } catch (e) {
    next(e)
  }
})
