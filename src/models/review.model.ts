import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
  Unique,
} from 'sequelize-typescript'
import { Optional } from 'sequelize'
import { PullRequest } from './pull-request.model'
import { GitHubReviewDto } from '../dto'

interface ReviewAttributes {
  id: number
  githubId: bigint
  pullId: number
  submittedOn: Date
  data: GitHubReviewDto
}

type ReviewCreationAttributes = Optional<ReviewAttributes, 'id'>

@Table({
  tableName: 'review',
  underscored: true,
  timestamps: false,
})
export class Review extends Model<ReviewAttributes, ReviewCreationAttributes> {
  @Unique
  @Column
  githubId!: bigint

  @ForeignKey(() => PullRequest)
  @Column
  pullId!: number

  @BelongsTo(() => PullRequest)
  pullRequest?: PullRequest

  @Column
  submittedOn!: Date

  @Column(DataType.JSON)
  data!: GitHubReviewDto
}
