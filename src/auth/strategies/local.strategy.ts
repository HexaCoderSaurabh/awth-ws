import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from 'src/user/user.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy)
{
    constructor(private userService: UserService) {
        super();
    }

    async validate(username: string, password: string): Promise<any> {
        const user = await this.userService.findUserByName(username);
        if (!user) {
            throw new UnauthorizedException('User not Found!')
        }
        const validPassword: boolean = await this.userService.verifyPassword(username, password);
        if (!validPassword) {
            throw new UnauthorizedException('Invalid Credentials!')
        }
        return user;
    }
}