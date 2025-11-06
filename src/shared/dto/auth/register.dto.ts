import {
  IsDefined,
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  Length,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Match } from './match.decorator';

export class RegisterDto {
  @IsPhoneNumber('UZ')
  @IsDefined({ message: 'Phone number is requireddd' })
  phone: string;

  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  @MinLength(3, {
    message: 'Name must be longer than 3 characters',
  })
  name: string;

  @IsString()
  @MinLength(8)
  @MaxLength(16)
  @IsNotEmpty()
  @IsDefined({ message: 'Password is required' })
  password: string;

  @IsString()
  @IsDefined({ message: 'Confirm password is required' })
  @Match('password', {
    message: 'Must match the password field',
  })
  confirmPassword: string;
}

export class checkPhoneDto {
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  @MinLength(3, {
    message: 'Name must be longer than 3 characters',
  })
  name: string;

  @IsPhoneNumber('UZ')
  @IsDefined({ message: 'Phone number is required' })
  phone: string;
}
export class forgotPhoneDto {
  @IsPhoneNumber('UZ')
  @IsDefined({ message: 'Phone number is required' })
  phone: string;
}

export class VerifyOtpDto {
  @IsPhoneNumber('UZ')
  @IsDefined({ message: 'Phone number is required' })
  phone: string;

  @IsString({ message: 'OTP must be a string' })
  @IsDefined({ message: 'OTP is required' })
  @Matches(/^\d+$/, { message: 'OTP must contain only numbers' })
  @Length(6, 6, { message: 'OTP must be 6 digits' })
  otp: string;
}

export class ChangePasswordDto {
  @IsPhoneNumber('UZ')
  @IsDefined({ message: 'Phone number is required' })
  phone: string;

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
