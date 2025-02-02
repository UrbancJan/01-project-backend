import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { jwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { NewQuoteDto } from 'src/dto/new-quote.dto';
import { UserService } from './user.service';
import { NewPasswordDto } from 'src/dto/new-password.dto';

@Controller('')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(jwtAuthGuard)
  @Get('me')
  me(@Req() request) {
    const data = this.userService.me(request.user.id);
    return data;
  }

  @UseGuards(jwtAuthGuard)
  @Post('myquote')
  myquote(@Body() createQoute: NewQuoteDto, @Req() request) {
    return this.userService.createUpdateQuote(createQoute, request.user.id);
  }

  @UseGuards(jwtAuthGuard)
  @Post('user/:id/upvote')
  upvote(@Req() request, @Param('id') id: number) {
    return this.userService.upvote(request.user.id, id);
  }

  @UseGuards(jwtAuthGuard)
  @Post('user/:id/downvote')
  downvote(@Req() request, @Param('id') id: number) {
    return this.userService.downvote(request.user.id, id);
  }

  @UseGuards(jwtAuthGuard)
  @Put('me/update-password')
  async updatePassword(@Req() request, @Body() newPassword: NewPasswordDto) {
    const data = await this.userService.updatePassword(
      request.user.id,
      newPassword,
    );
    return data;
  }

  @Get('user/:id')
  usersInfo(@Param('id') id: number) {
    return this.userService.usersInfo(id);
  }

  @Get('list')
  list() {
    return this.userService.list();
  }

  @UseGuards(jwtAuthGuard)
  @Get('/liked/:id')
  getLikedQuotes(@Param('id') id: number) {
    const data = this.userService.liked(id);
    return data;
  }

  @Get('random-quote')
  randomQuote() {
    const data = this.userService.randomQuote();
    return data;
  }
}
