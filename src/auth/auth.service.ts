import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { CreateUserDTO } from '../dtos/createUser.dto';
import { LoginDto } from '../dtos/login.dto';

@Injectable()
export class AuthService {
  constructor(private userService: UserService) { }

  async login(loginDto: LoginDto) {
    const { username, password } = loginDto;

    const user = await this.userService.findUserByName(username);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatches = await this.userService.verifyPassword(username, password);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  async register(userDto: CreateUserDTO) {
    const { username } = userDto;

    // Check if user already exists
    const userExists = await this.userService.findUserByName(username);
    if (userExists) {
      throw new ConflictException('Username already exists');
    }

    // Create user
    return this.userService.createUser(userDto);
  }
}
