import { Inject, Service } from 'typedi'
import { DATABASE, LOGGER } from '../config'
import { Logger } from 'winston'
import { Sequelize } from 'sequelize-typescript'
import { GitHubService } from './github.service'
import { User } from '../models/user.model'
import { UserSession } from '../models/user-session.model'

@Service()
export class UserService {
  constructor(
    private github: GitHubService,
    @Inject(LOGGER)
    private logger: Logger,
    @Inject(DATABASE)
    private db: Sequelize
  ) {}

  async createSession(code: string): Promise<string> {
    const authenticationToken = await this.github.authorize(code)
    const userInfo = await this.github.getUser(authenticationToken)
    const t = await this.db.transaction()
    try {
      let user = await User.findOne({
        where: {
          username: userInfo.login,
        },
        transaction: t,
      })
      if (!user) {
        // user does not exist yet -> create user
        user = await User.create(
          {
            username: userInfo.login,
          },
          {
            transaction: t,
          }
        )
      }

      const session = await UserSession.create(
        {
          sessionId: authenticationToken,
          userId: user.id,
        },
        {
          transaction: t,
        }
      )
      await t.commit()
      return session.sessionId
    } catch (e) {
      this.logger.error(e)
      await t.rollback()
      throw e
    }
  }
}
