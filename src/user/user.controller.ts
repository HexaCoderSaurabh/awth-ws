import { BadRequestException, Body, Controller, Get, HttpStatus, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { Users } from 'src/entities/user.entity';
import { ApiTags, ApiResponse, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { CreateUserDTO } from 'src/dtos/createuser.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { TokenQueryDto } from 'src/dtos/tokenQuery.dto';
import { GetUserPipe } from 'src/pipe/getUser.pipe';

interface AuthenticatedRequest extends Request {
  user: Users; // Assuming Users is the type of your user object
}
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
    return await this.userService.findUserByName(id);
  }

  @Get('verify-email')
  @ApiResponse({ status: HttpStatus.OK, description: 'User Token verification' })
  async verifyEmail(
    @Query() tokenQuery: TokenQueryDto,
    @Query('username', GetUserPipe) user: Users,
  ): Promise<string> {
    const isValidEmail = await this.userService.verifyToken(tokenQuery, user);
    console.log(isValidEmail);
    
    if (isValidEmail) {
      return 'Successfully verified email';
    } else {
      return 'Invalid Token'
    }
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiParam({ name: 'username', required: true, type: String })
  getUserDetails(@Req() req: AuthenticatedRequest) {
    const { user } = req
    const { username, email, firstName, lastName } = user as Users;
    return { username, email, firstName, lastName };
  }

}
