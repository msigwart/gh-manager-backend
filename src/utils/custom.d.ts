import { User } from '../models/user.model'

interface Context {
  user: User
  sessionId: string
}

declare global {
  namespace Express {
    interface Request {
      context: Context
    }
  }
}
