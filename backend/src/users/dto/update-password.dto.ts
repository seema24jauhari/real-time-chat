import { IsString, MinLength, Matches } from 'class-validator'

export class UpdatePasswordDto {
  @IsString()
  currentPassword: string

  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])/, {
    message: 'Password must contain uppercase, lowercase, number and special character'
  })
  newPassword: string
}