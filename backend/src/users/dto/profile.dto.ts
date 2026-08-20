import { IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class UpdateProfileDto {
  @IsNotEmpty({ message: 'Name is required' })
  name: string

  @IsOptional()
  @IsString()
  avatarUrl?: string // after upload, store the URL not the file
}