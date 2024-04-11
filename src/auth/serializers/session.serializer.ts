import { Users } from '../../entities/user.entity';
import { PassportSerializer } from '@nestjs/passport';
import { UserService } from 'src/user/user.service';

export class SessionSerializer extends PassportSerializer {

  constructor(private userService: UserService){
    super();
  }

  serializeUser(user: any, done: Function) {
    const { id, username } = user;
    done(null, { id, username });
  }
  async deserializeUser(payload: any, done: Function) {
    const { id, username, email, firstName, lastName }: Users = await this.userService.findUserByName(payload.username);
    done(null, { id, username, email, firstName, lastName });
  }
}