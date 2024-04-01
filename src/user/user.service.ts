import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDTO } from 'src/dtos/createuser.dto';
import { TokenQueryDTO } from 'src/dtos/tokenQuery.dto';
import { EmailService } from 'src/email/email.service';
import { Token } from 'src/entities/token.entity';
import { Users } from 'src/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  private logger = new Logger('userService');
  constructor(
    @InjectRepository(Token)
    private tokenRepository: Repository<Token>,
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService
  ) { }

  async getAllUser(): Promise<Users[]> {
    return await this.userRepository.find();
  }

  async findUser(id : string):Promise<Users | null> {
    return this.userRepository.findOneBy({ id });
  }

  async createUser(user: CreateUserDTO): Promise<CreateUserDTO> {
    try {
      const newUser = this.userRepository.create(user);
      const pepper = await this.configService.get<string>('PEPPER');

      await newUser.addPassword(pepper);
      await newUser.generateEVToken();
      this.emailService.sendVerificationEmail(newUser.email, newUser.emailVerificationToken, newUser.username)

      const res =  await this.userRepository.save(newUser);
      this.logger.verbose('Successfully created user');
      const { username, email, password, firstName, lastName } = res
      const responseData: CreateUserDTO = {
        username,
        email,
        password,
        firstName,
        lastName
      };
      return responseData
    }
    catch (err) {
      this.logger.error("Error while creating user", err);
      throw new BadRequestException({ message: "Error while user creation", error: err.message });
    }
  }

  async verifyToken(tokenQueryDTO: TokenQueryDTO): Promise<boolean> {
    let result: boolean = false
    try {
      const { token, username } = tokenQueryDTO
      const user: Users = await this.userRepository.findOneBy({ username });
      result = await user.verifyEVToken(token)
      if (result) {
        await this.userRepository.save(user)
      }
    } catch (error) {
      this.logger.error('Error while verifying token:', error);
      throw new BadRequestException({ message: 'Token Verification Failed', errors: error.message });
    } finally {
      return result
    }
  }
}