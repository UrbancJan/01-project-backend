import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { jwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { NewQuoteDto } from 'src/dto/new-quote.dto';
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

  @UseGuards(jwtAuthGuard)
  @Post('myquote')
  myquote(@Body() createQoute: NewQuoteDto, @Req() request) {
    return this.userService.createQuote(createQoute, request.user.id);
  }

  @UseGuards(jwtAuthGuard)
  @Put('myquote')
  myquoteUpdate(@Body() updateQoute: NewQuoteDto, @Req() request) {
    return this.userService.updateQuote(updateQoute, request.user.id);
  }
}
