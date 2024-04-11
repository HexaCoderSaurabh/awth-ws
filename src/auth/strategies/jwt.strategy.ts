import { FindUserDTO } from '../../dtos/findUser.dto';
import { Users } from '../../entities/user.entity';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
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

  async validate(payload: FindUserDTO): Promise<Users | null> {
    const user = await this.userService.findUserByName(payload.username)
    return user
  }

}