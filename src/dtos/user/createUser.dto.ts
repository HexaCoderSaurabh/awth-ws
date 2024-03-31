import { IsNotEmpty, IsString, IsBoolean, IsInt, IsOptional, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'john.doe', description: 'The username of the user' })
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty({ example: 'john.doe@example.com', description: 'The email address of the user' })
  @IsNotEmpty()
  @IsString()
  email: string;

  @ApiProperty({ example: 'secretpassword', description: 'The password of the user' })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty({ example: 'John', description: 'The first name of the user' })
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'The last name of the user' })
  @IsNotEmpty()
  @IsString()
  lastName: string;
}