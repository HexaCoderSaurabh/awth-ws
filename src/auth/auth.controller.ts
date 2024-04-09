import { Controller, Post, Body, ValidationPipe, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from '../dtos/login.dto';
import { CreateUserDTO } from '../dtos/createUser.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: "Login", operationId: "login" })
  @ApiResponse({ status: HttpStatus.OK, description: 'User loggedIn successfully.' })
  async login(@Body(ValidationPipe) loginDto: LoginDto) {
    return await this.authService.login(loginDto);
  }

  @Post('register')
  @ApiOperation({ summary: "Sign up", operationId: "Sign up" })
  @ApiResponse({ status: HttpStatus.OK, description: 'User registered successfully.' })
  async register(@Body(ValidationPipe) registerDto: CreateUserDTO) {
    return await this.authService.register(registerDto);
  }
}
