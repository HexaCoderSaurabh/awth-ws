import { Controller, Get } from '@nestjs/common';

@Controller('user')
export class UserController {

  @Get()
  getAllUser(): string {
    return 'This action returns all cats';
  }
}
