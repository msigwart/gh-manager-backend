import express from 'express'
import { requiresAuth } from '../middleware/auth.middleware'
import { Container } from 'typedi'
import { UserService } from '../services/user.service'
import { LOGGER } from '../config'
import { body, validationResult } from 'express-validator'
import {
  INVALID_REQUEST_BODY_ERROR,
  MISSING_SESSION_ID_ERROR,
  ValidationError,
} from '../errors'
import { RepoUser } from '../models/repo-user.model'

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

reposApi.patch(
  '/:id',
  requiresAuth,
  body('isFollowed').exists(),
  async (req, res, next) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        throw new ValidationError(
          INVALID_REQUEST_BODY_ERROR,
          "Field 'isFollowed' is missing"
        )
      }
      const logger = Container.get(LOGGER)
      const { isFollowed } = req.body
      const { id: repoId } = req.params
      logger.info(
        `${isFollowed ? 'Following' : 'Unfollowing'} repo ${repoId}...`
      )
      await RepoUser.update(
        { isFollowed },
        {
          where: {
            userId: req.context.user.id,
            repoId,
          },
        }
      )
      res.status(204).send()
    } catch (e) {
      next(e)
    }
  }
)
