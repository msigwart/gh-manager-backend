import {
  Column,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript'
import { Repo } from './repo.model'
import { User } from './user.model'

interface RepoAttributes {
  userId: number
  repoId: number
  isFollowed: boolean
}

@Table({
  tableName: 'repo_user',
  underscored: true,
  timestamps: false,
})
export class RepoUser extends Model<RepoAttributes, RepoAttributes> {
  @ForeignKey(() => Repo)
  @Column
  repoId!: number

  @ForeignKey(() => User)
  @Column
  userId!: number

  @Column
  isFollowed!: boolean
}
