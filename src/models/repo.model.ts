import {
  Column,
  CreatedAt,
  DataType,
  Model,
  Table,
  Unique,
  UpdatedAt,
} from 'sequelize-typescript'
import { Optional } from 'sequelize'

interface RepoAttributes {
  id: number
  githubId: bigint
  name: string
  fullName: string
  createdOn: Date
  updatedOn: Date
  data: never
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
  data!: never
}
