import {
  BelongsToMany,
  Column,
  CreatedAt,
  DataType,
  Model,
  Table,
  Unique,
  UpdatedAt,
} from 'sequelize-typescript'
import { Optional } from 'sequelize'
import { Repo } from './repo.model'
import { RepoUser } from './repo-user.model'

interface UserAttributes {
  id: number
  username: string
  createdOn: Date
  updatedOn: Date
  data: never
  repos: Repo[]
}

type UserCreationAttributes = Optional<
  UserAttributes,
  'id' | 'createdOn' | 'updatedOn' | 'repos'
>

@Table({
  tableName: 'registered_user',
  underscored: true,
  timestamps: true,
})
export class User extends Model<UserAttributes, UserCreationAttributes> {
  @Unique
  @Column
  username!: string

  @CreatedAt
  @Column
  createdOn!: Date

  @UpdatedAt
  @Column
  updatedOn!: Date

  @Column(DataType.JSON)
  data!: never

  @BelongsToMany(() => Repo, () => RepoUser)
  repos?: Repo[]
}
