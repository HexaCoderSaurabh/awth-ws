import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDTO } from 'src/dtos/createuser.dto';
import { TokenQueryDto } from 'src/dtos/tokenQuery.dto';
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

  async createUser(user: CreateUserDTO): Promise<CreateUserDTO | null> {
    try {
      const newUser = this.userRepository.create({...user});
      const pepper = await this.configService.get<string>('PEPPER');

      await newUser.addPassword(pepper);
      await newUser.generateEVToken();

      const savedUser = await this.userRepository.save(newUser);
      this.logger.verbose('Successfully created user');
       await this.emailService.sendVerificationEmail(savedUser.email, savedUser.emailVerificationToken, savedUser.username)

      const { id, username, email, password, firstName, lastName } = savedUser
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

    async verifyToken(tokenQueryDTO: TokenQueryDto, user: Users): Promise<boolean> {
      console.log(user, tokenQueryDTO);
      
      let result: boolean = false
      try {
        const { token } = tokenQueryDTO
        result = await user.verifyEVToken(token)
        if (result) {
          await this.userRepository.save(user)
          return true;
        }
        else return false;
      } catch (error) {
        this.logger.error('Error while verifying token:', error);
        throw new BadRequestException({ message: 'Token Verification Failed', errors: error.message });
      } finally {
        return result
      }
    }
  
    async verifyPassword(username:string, password: string): Promise<boolean> {
      try {
        const user: Users = await this.findUserByName(username)
        const valid = user.validatePassword(password, this.configService.get<string>('PEPPER'))
        return valid
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