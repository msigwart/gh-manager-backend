import { Inject, Service } from 'typedi'
import { DATABASE, LOGGER } from '../config'
import { Logger } from 'winston'
import { Sequelize } from 'sequelize-typescript'
import { GitHubService } from './github.service'
import { Repo } from '../models/repo.model'
import {Issue} from "../models/issue.model";

@Service()
export class RepoService {
  constructor(
    private github: GitHubService,
    @Inject(LOGGER)
    private logger: Logger,
    @Inject(DATABASE)
    private db: Sequelize
  ) {}

  async getActivityOfRepos(repoIds: number[]): Promise<Repo[]> {
    return [];
    // const userWithRepos = await user.reload({
    //   include: [
    //     {
    //       model: Repo,
    //       as: 'repos',
    //       through: { attributes: ['isFollowed'] }, // this may not be needed
    //     },
    //   ],
    // })
    // const repos = userWithRepos.repos
    // return repos ? repos : []
  }

  async getPullRequestsOfRepos(repoIds: number[]): Promise<Repo[]> {
    return [];
    // const userWithRepos = await user.reload({
    //   include: [
    //     {
    //       model: Repo,
    //       as: 'repos',
    //       through: { attributes: ['isFollowed'] }, // this may not be needed
    //     },
    //   ],
    // })
    // const repos = userWithRepos.repos
    // return repos ? repos : []
  }

  async refreshIssuesOfRepo(repo: Repo, token: string): Promise<void> {
    this.logger.info(`Refreshing issues for repo ${repo.fullName}`)
    const issues = await this.github.getIssuesOfRepo(repo, token)
    const t = await this.db.transaction()
    try {
      for (const issue of issues) {
        await Issue.findOrCreate({
          where: {
            githubId: issue.id,
          },
          defaults: {
            githubId: issue.id,
            repoId: repo.id,
            createdOn: new Date(issue.created_at),
            updatedOn: new Date(issue.updated_at),
            data: issue as never,
          },
          transaction: t,
        })
      }
      await t.commit()
    } catch (e) {
      this.logger.error(e)
      await t.rollback()
      throw e
    }
  }
}
