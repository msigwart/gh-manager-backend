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
import { Repo } from './repo.model'

interface IssueAttributes {
  id: number
  githubId: bigint
  repoId: number
  createdOn: Date
  updatedOn: Date
  data: never
}

type IssueCreationAttributes = Optional<IssueAttributes, 'id'>

@Table({
  tableName: 'issue',
  underscored: true,
  timestamps: false,
})
export class Issue extends Model<IssueAttributes, IssueCreationAttributes> {
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
  data!: never
}
