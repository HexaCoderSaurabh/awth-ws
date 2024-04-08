import { FindUserDTO } from '@dtos/user/findUser.dto';
import { User } from '@entities/user.entity';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { HttpRequest } from 'aws-sdk';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from 'src/user/user.service';

@Injectable()
export class JWTStrategy extends PassportStrategy(Strategy, 'jwt') {

  constructor(private userService: UserService, configService: ConfigService){
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('bearer'),
      secretOrKey: configService.get<string>('ACCESS_TOKEN_SECRET'),
      ignoreExpiration: false
    })
  }

  async validate(payload: FindUserDTO): Promise<User | null> {
    const user = await this.userService.findOneByIdOrUsername(payload.username || payload.email)
    return user
  }

}