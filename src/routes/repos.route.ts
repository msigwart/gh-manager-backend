import express from 'express'
import { requiresAuth } from '../middleware/auth.middleware'
import { Container } from 'typedi'
import { UserService } from '../services/user.service'
import { LOGGER } from '../config'

export const reposApi = express.Router()

reposApi.get('/', requiresAuth, async (req, res, next) => {
  try {
    const logger = Container.get(LOGGER)
    logger.info('Retrieving repos of user...')
    const userService = Container.get(UserService)
    let repos = await userService.getReposOfUser(req.context.user)
    if (repos.length === 0) {
      // try to refresh GitHub data if user has no associated repos yet
      await userService.refreshUserData(req.context.user, req.context.sessionId)
      repos = await userService.getReposOfUser(req.context.user)
    }
    res.status(200).json(repos)
  } catch (e) {
    next(e)
  }
})
