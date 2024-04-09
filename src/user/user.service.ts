import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDTO } from 'src/dtos/createuser.dto';
import { EmailService } from 'src/email/email.service';
import { Users } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
require('dotenv').config({ path: `.env.stage.${process.env.STAGE}` })

@Injectable()
export class UserService {
  private logger = new Logger('userService');
  constructor(
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService
  ) { }

  async getAllUser(): Promise<Users[]> {
    return await this.userRepository.find();
  }

  async findUser(id: string): Promise<Users | null> {
    return this.userRepository.findOneBy({ id });
  }

  async findUserByName(username: string): Promise<Users | null> {
    return this.userRepository.findOneBy({ username });
  }

  async createUser(user: CreateUserDTO): Promise<CreateUserDTO> {
    try {
      const { username, email, password, firstName, lastName } = user;
      const newUser = this.userRepository.create(user);
      const pepper = await this.configService.get<string>('PEPPER');

      await newUser.addPassword(password,pepper);
      await newUser.generateEVToken();

      const savedUser = await this.userRepository.save(newUser);
      this.logger.verbose('Successfully created user');
      this.emailService.sendVerificationEmail(savedUser.email, savedUser.emailVerificationToken, savedUser.username)

      const responseData: CreateUserDTO = {
        username: savedUser.username,
        email: savedUser.email,
        password: savedUser.password,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName
      };
      return responseData
    }
    catch (err) {
      this.logger.error("Error while creating user", err);
      throw new BadRequestException({ message: "Error while user creation", error: err.message });
    }
  }

  async verifyPassword(username: string, password: string): Promise<boolean> {
    try {
      const user: Users = await this.findUserByName(username)
      const valid = user.validatePassword(password, this.configService.get<string>('PEPPER'))
      return valid;
    } catch (error) {
      this.logger.error('Error while verifying password:', error);
      return false
    }
  }

}


// generate unique pepper -------------------------------------
// function generatePepper() {
//       const pepperLength = 30;
//       const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
//       let pepper = '';
//       for (let i = 0; i < pepperLength; i++) {
//           pepper += characters.charAt(Math.floor(Math.random() * characters.length));
//       }
//       return pepper;
//   }