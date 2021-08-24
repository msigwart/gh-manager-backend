import {
  Column,
  CreatedAt,
  Model,
  Table,
  Unique,
  UpdatedAt,
} from 'sequelize-typescript'
import { Optional } from 'sequelize'

interface UserAttributes {
  id: number
  username: string
  createdOn: Date
  updatedOn: Date
}

type UserCreationAttributes = Optional<
  UserAttributes,
  'id' | 'createdOn' | 'updatedOn'
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
}
