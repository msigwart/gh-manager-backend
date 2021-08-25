import { Inject, Service } from 'typedi'
import { DATABASE, LOGGER } from '../config'
import { Logger } from 'winston'
import { Sequelize } from 'sequelize-typescript'
import { GitHubService } from './github.service'
import { Repo } from '../models/repo.model'
import { Issue } from '../models/issue.model'
import { PullRequest } from '../models/pull-request.model'
import { Transaction } from 'sequelize'
import { Review } from '../models/review.model'

@Service()
export class RepoService {
  constructor(
    private github: GitHubService,
    @Inject(LOGGER)
    private logger: Logger,
    @Inject(DATABASE)
    private db: Sequelize
  ) {}

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
            data: issue,
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

  async refreshPullRequestsOfRepo(repo: Repo, token: string): Promise<void> {
    this.logger.info(`Refreshing pull requests for repo ${repo.fullName}`)
    const pullRequests = await this.github.getPullRequestsOfRepo(repo, token)
    const t = await this.db.transaction()
    try {
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
          transaction: t,
        })
        if (created) {
          this.logger.info(`Added pull request ${createdPR.githubId} to database`)
        }
        await this.refreshReviewsOfPullRequests(repo, createdPR, token, t)
      }
      await t.commit()
    } catch (e) {
      this.logger.error(e)
      await t.rollback()
      throw e
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
