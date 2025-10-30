import {
  IsDefined,
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Match } from '../auth/match.decorator';

export class ChangePasswordDto {
  @IsString()
  @MinLength(8)
  @MaxLength(16)
  @IsNotEmpty()
  @IsDefined({ message: 'Old password is required' })
  oldPassword: string;

  @IsString()
  @MinLength(8)
  @MaxLength(16)
  @IsNotEmpty()
  @IsDefined({ message: 'New password is required' })
  password: string;

  @IsString()
  @IsDefined({ message: 'Confirm password is required' })
  @Match('password', { message: 'Passwords do not match' })
  confirmPassword: string;
}
