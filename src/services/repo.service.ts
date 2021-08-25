import {Inject, Service} from 'typedi'
import {DATABASE, LOGGER} from '../config'
import {Logger} from 'winston'
import {Sequelize} from 'sequelize-typescript'
import {GitHubService} from './github.service'
import {Repo} from '../models/repo.model'
import {Issue} from '../models/issue.model'
import {PullRequest} from '../models/pull-request.model'
import {Transaction} from 'sequelize'
import {Review} from '../models/review.model'
import {User} from '../models/user.model'
import {UserSession} from '../models/user-session.model'
import {DATA_REFRESH_FAILED_ERROR, ServerError} from '../errors'
import {RepoUser} from '../models/repo-user.model'

@Service()
export class RepoService {
  constructor(
    private github: GitHubService,
    @Inject(LOGGER)
    private logger: Logger,
    @Inject(DATABASE)
    private db: Sequelize
  ) {}

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

  async refreshReposOfUser(user: User, token?: string): Promise<void> {
    this.logger.info(`Refreshing repos for user ${user.username}`)
    let authToken = token
    if (!authToken) {
      const session = await UserSession.findOne({
        where: {
          userId: user.id,
        },
      })
      if (!session) {
        throw new ServerError(
          DATA_REFRESH_FAILED_ERROR,
          `Cannot refresh data for user ${user.username}`
        )
      }
      authToken = session.sessionId
    }
    const repos = await this.github.getReposOfUser(user, authToken)
    const t = await this.db.transaction()
    try {
      for (const repo of repos) {
        const [createdRepo, created] = await Repo.findOrCreate({
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
        await this.refreshIssuesOfRepo(createdRepo, authToken, t)
        await this.refreshPullRequestsOfRepo(createdRepo, authToken, t)
      }
      user.lastSyncOn = new Date()
      await user.save()
      await t.commit()
    } catch (e) {
      this.logger.error(e)
      await t.rollback()
      throw e
    }
  }

  private async refreshIssuesOfRepo(
    repo: Repo,
    token: string,
    transaction: Transaction
  ): Promise<void> {
    this.logger.info(`Refreshing issues for repo ${repo.fullName}`)
    const issues = await this.github.getIssuesOfRepo(repo, token)
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
          data: issue,
        },
        transaction: transaction,
      })
    }
  }

  private async refreshPullRequestsOfRepo(
    repo: Repo,
    token: string,
    transaction: Transaction
  ): Promise<void> {
    this.logger.info(`Refreshing pull requests for repo ${repo.fullName}`)
    const pullRequests = await this.github.getPullRequestsOfRepo(repo, token)
    for (const pr of pullRequests) {
      const [createdPR, created] = await PullRequest.findOrCreate({
        where: {
          githubId: pr.id,
        },
        defaults: {
          githubId: pr.id,
          repoId: repo.id,
          createdOn: new Date(pr.created_at),
          updatedOn: new Date(pr.updated_at),
          data: pr,
        },
        transaction: transaction,
      })
      await this.refreshReviewsOfPullRequests(
        repo,
        createdPR,
        token,
        transaction
      )
    }
  }

  private async refreshReviewsOfPullRequests(
    repo: Repo,
    pull: PullRequest,
    token: string,
    transaction: Transaction
  ) {
    this.logger.info(`Refreshing reviews for pull request ${pull.id}`)
    const reviews = await this.github.getReviewsOfPullRequest(repo, pull, token)
    for (const review of reviews) {
      await Review.findOrCreate({
        where: {
          githubId: review.id,
        },
        defaults: {
          githubId: review.id,
          pullId: pull.id,
          submittedOn: new Date(review.submitted_at),
          data: review,
        },
        transaction: transaction,
      })
    }
  }
}
