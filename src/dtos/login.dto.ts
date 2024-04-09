import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty} from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'john.doe', description: 'The username of the user' })
  username: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'abc1234', description: 'The username of the user' })
  password: string;
}
