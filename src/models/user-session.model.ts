import { User } from './user.model'
import {
  AutoIncrement,
  BelongsTo,
  Column,
  CreatedAt,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
  Unique,
  UpdatedAt,
} from 'sequelize-typescript'
import { Optional } from 'sequelize'

interface UserSessionAttributes {
  id: bigint
  sessionId: string
  createdOn: Date
  lastAccessedOn: Date
  userId: number
}

type UserSessionCreationAttributes = Optional<
  UserSessionAttributes,
  'id' | 'createdOn' | 'lastAccessedOn'
>

@Table({
  tableName: 'user_session',
  underscored: true,
})
export class UserSession extends Model<
  UserSessionAttributes,
  UserSessionCreationAttributes
> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id!: bigint

  @Unique
  @Column
  sessionId!: string

  @CreatedAt
  @Column
  createdOn!: Date

  @UpdatedAt
  @Column
  lastAccessedOn!: Date

  @ForeignKey(() => User)
  @Column
  userId!: number

  @BelongsTo(() => User)
  user?: User
}
