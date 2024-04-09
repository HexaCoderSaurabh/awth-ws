import { Body, Controller, Get, HttpStatus, Param, Post, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { Users } from 'src/entities/user.entity';
import { ApiTags, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { CreateUserDTO } from 'src/dtos/createuser.dto';

@ApiTags('users')
@Controller('user')
export class UserController {
  constructor(private userService: UserService) { }
  @Get()
  @ApiResponse({ status: HttpStatus.OK, description: 'Fetched all users.' })
  getAllUser() {
    return this.userService.getAllUser();
  }

  @Post()
  @ApiResponse({ status: HttpStatus.OK, description: 'User created successfully.' })
  @ApiOperation({ summary: "Create a new user", operationId: "createUser" })
  async createUser(@Body() users: CreateUserDTO): Promise<CreateUserDTO> {
    return await this.userService.createUser(users);
  }

  @Get('/:userId')
  async findOne(@Param('userId') id: string): Promise<Users | null> {
    return await this.userService.findUser(id);
  }

}
