import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from '@dtos/user/createUser.dto';
import { UserService } from './user.service';
import { CreatedUserDto } from '@dtos/user/createdUser.dto';
import { TokenQueryDto } from '@dtos/user/tokenQuery.dto';

@Controller('user')
@ApiTags('Users')
export class UserController {

  constructor(private userService: UserService) { }

  @Post()
  @ApiOperation({ summary: 'Create a new user', operationId: 'createUser' })
  async createUser(@Body() createUserDto: CreateUserDto): Promise<CreatedUserDto> {
    const user = await this.userService.createUser(createUserDto)
    return user
  }

  @Get('verify-email')
  @ApiOperation({ summary: 'Verify email token', operationId: 'verifyEmail' })
  async verifyEmail(@Query() tokenQuery: TokenQueryDto): Promise<string> {
    const isValidEmail = await this.userService.verifyToken(tokenQuery)
    return isValidEmail ? 'Successfully verified email' : 'Invalid URL'
  }
}
