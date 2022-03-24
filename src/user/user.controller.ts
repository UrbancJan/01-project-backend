import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { jwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UserService } from './user.service';

@Controller('')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(jwtAuthGuard)
  @Get('me')
  me(@Req() request) {
    const data = this.userService.me(request.user.id);
    return data;
  }
}
