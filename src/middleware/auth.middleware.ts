import { RequestHandler } from 'express'
import { UserSession } from '../models/user-session.model'
import {
  AuthenticationError,
  INVALID_SESSION_ERROR,
  MISSING_SESSION_ID_ERROR,
  USER_NOT_FOUND_ERROR,
} from '../errors'
import { User } from '../models/user.model'

export const requiresAuth: RequestHandler = async (req, res, next) => {
  const sessionId = req.header('x-auth-token')
  if (!sessionId) {
    return next(
      new AuthenticationError(MISSING_SESSION_ID_ERROR, 'Missing session id')
    )
  }
  const userSession = await UserSession.findOne({
    where: {
      sessionId: sessionId,
    },
    include: [User],
  })

  if (!userSession) {
    return next(
      new AuthenticationError(INVALID_SESSION_ERROR, 'Non-existent session')
    )
  }
  if (!userSession.user) {
    return next(
      new AuthenticationError(USER_NOT_FOUND_ERROR, 'User does not exist')
    )
  }

  const now = new Date()
  const user = userSession.user
  userSession.lastAccessedOn = now
  await userSession.save()

  req.user = user
  next()
}
