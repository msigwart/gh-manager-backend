import { Inject, Service } from 'typedi'
import { DATABASE, LOGGER } from '../config'
import { Logger } from 'winston'
import { Sequelize } from 'sequelize-typescript'
import { GitHubService } from './github.service'
import { User } from '../models/user.model'
import { UserSession } from '../models/user-session.model'
import { Repo } from '../models/repo.model'
import { RepoUser } from '../models/repo-user.model'

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
            data: userInfo as never,
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

  async getReposOfUser(user: User): Promise<Repo[]> {
    const userWithRepos = await user.reload({
      include: [
        {
          model: Repo,
          as: 'repos',
          through: { attributes: ['isFollowed'] }, // this may not be needed
        },
      ],
    })
    const repos = userWithRepos.repos
    return repos ? repos : []
  }

  async refreshUserData(user: User, token: string): Promise<void> {
    this.logger.info('Refreshing user data')
    const repos = await this.github.getReposOfUser(user, token)
    const t = await this.db.transaction()
    try {
      for (const repo of repos) {
        const [createdRepo] = await Repo.findOrCreate({
          where: {
            githubId: repo.id,
          },
          defaults: {
            githubId: repo.id,
            name: repo.name,
            fullName: repo.full_name,
            data: repo as never,
          },
          transaction: t,
        })
        await RepoUser.findOrCreate({
          where: {
            userId: user.id,
            repoId: createdRepo.id,
          },
          transaction: t,
        })
      }
      await t.commit()
    } catch (e) {
      this.logger.error(e)
      await t.rollback()
    }
  }
}
