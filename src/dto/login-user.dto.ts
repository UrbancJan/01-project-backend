import { IsEmail, IsNotEmpty, IsNumber, IsString } from 'class-validator';
export class LoginUserDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}
