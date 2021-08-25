import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
  Unique,
} from 'sequelize-typescript'
import { Optional } from 'sequelize'
import { Repo } from './repo.model'
import { GitHubPullRequestDto } from '../dto'
import { Review } from './review.model'

interface PullRequestAttributes {
  id: number
  githubId: bigint
  repoId: number
  createdOn: Date
  updatedOn: Date
  data: GitHubPullRequestDto
}

type PullRequestCreationAttributes = Optional<PullRequestAttributes, 'id'>

@Table({
  tableName: 'pull_request',
  underscored: true,
  timestamps: false,
})
export class PullRequest extends Model<
  PullRequestAttributes,
  PullRequestCreationAttributes
> {
  @Unique
  @Column
  githubId!: bigint

  @ForeignKey(() => Repo)
  @Column
  repoId!: number

  @BelongsTo(() => Repo)
  repo?: Repo

  @Column
  createdOn!: Date

  @Column
  updatedOn!: Date

  @Column(DataType.JSON)
  data!: GitHubPullRequestDto

  @HasMany(() => Review)
  reviews?: Review
}
