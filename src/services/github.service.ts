import { Inject, Service } from 'typedi'
import { LOGGER } from '../config'
import { Logger } from 'winston'
import axios from 'axios'
import config from 'config'
import {GitHubUserDto} from "../dto";

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
}