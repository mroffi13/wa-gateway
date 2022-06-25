import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class Asset extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public media_name: String

  @column()
  public media_path: String

  @column()
  public media_original_name: String

  @column()
  public media_type: String

  @column()
  public created_id: BigInt

  @column()
  public created_name: String

  @column()
  public updated_id: BigInt

  @column()
  public updated_name: String

  @column.dateTime({ autoCreate: true })
  public created_at: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updated_at: DateTime
}
