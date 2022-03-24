import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NewQuoteDto } from 'src/dto/new-quote.dto';
import { Quote } from 'src/Entity/quote.entity';
import { User } from 'src/Entity/user.entity';
import { Vote } from 'src/Entity/vote.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Quote)
    private readonly quoteRepository: Repository<Quote>,
    @InjectRepository(Vote) private readonly voteRepository: Repository<Vote>,
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

    await this.voteRepository.save({
      userId: userId,
      quoteId: data.id,
      numberOfVotes: 0,
    });
    return 'OK';
  }
}
