import { Inject, Service } from 'typedi'
import { LOGGER } from '../config'
import { Logger } from 'winston'
import axios from 'axios'
import config from 'config'
import {
  GitHubIssueDto,
  GitHubPullRequestDto,
  GitHubRepoDto,
  GitHubReviewDto,
  GitHubUserDto,
} from '../dto'
import { User } from '../models/user.model'
import { Repo } from '../models/repo.model'
import { PullRequest } from '../models/pull-request.model'

@Service()
export class GitHubService {
  constructor(
    @Inject(LOGGER)
    private logger: Logger
  ) {}

  async authorize(code: string): Promise<string> {
    const response = await axios.post(
      'https://github.com/login/oauth/access_token',
      {},
      {
        params: {
          code: code,
          client_id: config.get('github.clientId'),
          client_secret: config.get('github.clientSecret'),
        },
        headers: {
          Accept: 'application/json',
        },
      }
    )
    const { access_token } = response.data
    return access_token
  }

  async getUser(token: string): Promise<GitHubUserDto> {
    const response = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `token ${token}`,
      },
    })
    return response.data
  }

  async getReposOfUser(user: User, token: string): Promise<GitHubRepoDto[]> {
    const response = await axios.get(
      `https://api.github.com/users/${user.username}/repos`,
      {
        headers: {
          Authorization: `token ${token}`,
        },
      }
    )
    return response.data
  }

  async getIssuesOfRepo(repo: Repo, token: string): Promise<GitHubIssueDto[]> {
    const response = await axios.get(
      `https://api.github.com/repos/${repo.fullName}/issues?state=all`,
      {
        headers: {
          Authorization: `token ${token}`,
        },
      }
    )
    return response.data
  }

  async getPullRequestsOfRepo(
    repo: Repo,
    token: string
  ): Promise<GitHubPullRequestDto[]> {
    const response = await axios.get(
      `https://api.github.com/repos/${repo.fullName}/pulls?state=all`,
      {
        headers: {
          Authorization: `token ${token}`,
        },
      }
    )
    return response.data
  }

  async getReviewsOfPullRequest(
    repo: Repo,
    pull: PullRequest,
    token: string
  ): Promise<GitHubReviewDto[]> {
    const response = await axios.get(
      `https://api.github.com/repos/${repo.fullName}/pulls/${pull.data.number}/reviews`,
      {
        headers: {
          Authorization: `token ${token}`,
        },
      }
    )
    return response.data
  }
}
