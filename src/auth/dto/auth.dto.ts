import { IsEmail, IsNotEmpty, IsString, Length, isNotEmpty } from 'class-validator';

export class signupDto {
  @IsNotEmpty()
  @IsString()
  name: string

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @IsString()
  @Length(6,20, {message: 'Password Must Be Between 6 and 20 chars'})
  password: string;
}

export class signinDto {
  @IsNotEmpty()
  @IsString()
  email: string

  @IsNotEmpty()
  @IsString()
  password: string
}