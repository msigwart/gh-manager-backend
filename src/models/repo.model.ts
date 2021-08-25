import {
  Column,
  CreatedAt,
  DataType,
  HasMany,
  Model,
  Table,
  Unique,
  UpdatedAt,
} from 'sequelize-typescript'
import { Optional } from 'sequelize'
import { Issue } from './issue.model'
import { PullRequest } from './pull-request.model'
import { GitHubRepoDto } from '../dto'

interface RepoAttributes {
  id: number
  githubId: bigint
  name: string
  fullName: string
  createdOn: Date
  updatedOn: Date
  data: GitHubRepoDto
}

type RepoCreationAttributes = Optional<
  RepoAttributes,
  'id' | 'createdOn' | 'updatedOn'
>

@Table({
  tableName: 'repo',
  underscored: true,
  timestamps: true,
})
export class Repo extends Model<RepoAttributes, RepoCreationAttributes> {
  @Unique
  @Column
  githubId!: bigint

  @Column
  name!: string

  @Unique
  @Column
  fullName!: string

  @CreatedAt
  @Column
  createdOn!: Date

  @UpdatedAt
  @Column
  updatedOn!: Date

  @Column(DataType.JSON)
  data!: GitHubRepoDto

  @HasMany(() => Issue)
  issues?: Issue[]

  @HasMany(() => PullRequest)
  pullRequests?: PullRequest[]
}
