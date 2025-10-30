import {
  IsDefined,
  IsPhoneNumber,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class loginDto {
  @IsPhoneNumber('UZ')
  @IsDefined()
  phone: string;

  @IsString()
  @MinLength(8)
  @IsDefined()
  @MaxLength(16)
  password: string;
}
