import { UserService } from '../services/user.service'
import { Container } from 'typedi'
import { body, header, validationResult } from 'express-validator'
import {
  MISSING_LOGIN_CODE_ERROR,
  MISSING_SESSION_ID_ERROR,
  ValidationError,
} from '../errors'
import express from 'express'
import { requiresAuth } from '../middleware/auth.middleware'
import { LOGGER } from '../config'
import { UserSession } from '../models/user-session.model'

export const authApi = express.Router()

authApi.get('/me', requiresAuth, async (req, res) => {
  res.status(200).json(req.context.user)
})

authApi.post('/session', body('code').exists(), async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      throw new ValidationError(MISSING_LOGIN_CODE_ERROR, 'Missing login code')
    }
    const userService = Container.get(UserService)
    const sessionId = await userService.createSession(req.body.code)
    res.status(201).send({ sessionId })
  } catch (e) {
    next(e)
  }
})

authApi.delete(
  '/session',
  requiresAuth,
  header('x-auth-token').exists().notEmpty(),
  async (req, res, next) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        throw new ValidationError(
          MISSING_SESSION_ID_ERROR,
          'Missing session id'
        )
      }
      const sessionId = req.header('x-auth-token')
      const logger = Container.get(LOGGER)
      logger.info(`Delete session (logout): ${sessionId}`)
      await UserSession.destroy({
        where: {
          sessionId: sessionId,
        },
      })
      res.status(204).send()
    } catch (e) {
      next(e)
    }
  }
)
