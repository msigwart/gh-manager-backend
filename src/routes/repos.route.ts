import express from 'express'
import { requiresAuth } from '../middleware/auth.middleware'
import { Container } from 'typedi'
import { LOGGER } from '../config'
import { body, validationResult } from 'express-validator'
import { INVALID_REQUEST_BODY_ERROR, ValidationError } from '../errors'
import { RepoUser } from '../models/repo-user.model'
import { Issue } from '../models/issue.model'
import { RepoService } from '../services/repo.service'
import { Repo } from '../models/repo.model'
import { PullRequest } from '../models/pull-request.model'
import { Review } from '../models/review.model'

export const reposApi = express.Router()

reposApi.get('/', requiresAuth, async (req, res, next) => {
  try {
    const logger = Container.get(LOGGER)
    logger.info('Retrieving repos of user...')
    const repoService = Container.get(RepoService)
    let repos = await repoService.getReposOfUser(req.context.user)
    if (repos.length === 0) {
      // try to refresh GitHub data if user has no associated repos yet
      await repoService.refreshReposOfUser(
        req.context.user,
        req.context.sessionId
      )
      repos = await repoService.getReposOfUser(req.context.user)
    }
    res.status(200).json(repos)
  } catch (e) {
    next(e)
  }
})

reposApi.get('/issues', requiresAuth, async (req, res, next) => {
  try {
    const logger = Container.get(LOGGER)
    logger.info('Retrieving issues of repos followed by user...')
    const repos = await RepoUser.findAll({
      where: {
        userId: req.context.user.id,
        isFollowed: true,
      },
      attributes: ['repoId'],
    })
    if (repos.length <= 0) {
      return res.status(200).json([])
    }
    const issues = await Issue.findAll({
      where: {
        repoId: repos.map((repo) => repo.repoId),
      },
      include: [Repo],
      order: [['createdOn', 'DESC']],
    })
    res.status(200).json(issues)
  } catch (e) {
    next(e)
  }
})

reposApi.get('/pulls', requiresAuth, async (req, res, next) => {
  try {
    const logger = Container.get(LOGGER)
    logger.info('Retrieving issues of repos followed by user...')
    const repos = await RepoUser.findAll({
      where: {
        userId: req.context.user.id,
        isFollowed: true,
      },
      attributes: ['repoId'],
    })
    if (repos.length <= 0) {
      return res.status(200).json([])
    }
    const pulls = await PullRequest.findAll({
      where: {
        repoId: repos.map((repo) => repo.repoId),
      },
      include: [Repo, Review],
      order: [
        ['createdOn', 'DESC'],
        ['reviews', 'submittedOn', 'DESC'],
      ],
    })
    res.status(200).json(pulls)
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
      // todo: check if repo exists
      res.status(204).send()
    } catch (e) {
      next(e)
    }
  }
)
