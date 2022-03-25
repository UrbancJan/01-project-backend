import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NewQuoteDto } from 'src/dto/new-quote.dto';
import { Quote } from 'src/Entity/quote.entity';
import { User } from 'src/Entity/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Quote)
    private readonly quoteRepository: Repository<Quote>,
  ) {}

  async me(id: number): Promise<any> {
    const user = await this.userRepository.findOne({ id: id });

    const { password, ...result } = user;

    return result;
  }

  async createQuote(payload: NewQuoteDto, userId: number): Promise<string> {
    const quote = new Quote();
    quote.content = payload.content;
    const data = await this.quoteRepository.save(quote);

    return 'OK';
  }

  async updateQuote(payload: NewQuoteDto, userId: number): Promise<string> {
    //todo najdi id od quota

    const quote = new Quote();
    quote.content = payload.content;
    const data = await this.quoteRepository.save(quote);

    return 'UPDATED';
  }

  //todo funckija za GET quota
}
