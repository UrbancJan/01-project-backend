import { Body, Controller, Post, Res } from '@nestjs/common';
import { CreateUserDto } from 'src/dto/create-user.dto';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { LoginUserDto } from 'src/dto/login-user.dto';

@Controller('')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  signup(@Body() createUser: CreateUserDto) {
    return this.authService.signup(createUser);
  }

  @Post('login')
  async login(
    @Body() body: LoginUserDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const data = await this.authService.login(body);
    response.cookie('jwt', data, { httpOnly: true });
    // return this.userService.login(body);
    return { msg: 'success' };
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('jwt');
    return { msg: 'success' };
  }
}
