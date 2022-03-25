import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NewQuoteDto } from 'src/dto/new-quote.dto';
import { Quote } from 'src/Entity/quote.entity';
import { User } from 'src/Entity/user.entity';
import { IsNull, Repository } from 'typeorm';

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

  async createUpdateQuote(
    payload: NewQuoteDto,
    userId: number,
  ): Promise<string> {
    //najprej pogleda, če ima uporabnik ze quote
    const user = await this.userRepository
      .createQueryBuilder()
      .select('user')
      .from(User, 'user')
      .where('user.id=:id', { id: userId })
      .getOne();

    if (user.quote_id == null) {
      //uporabnik še nima dodanega quota
      const quote = new Quote();
      quote.content = payload.content;
      quote.votes = 0;
      const newQuote = await this.quoteRepository.save(quote);

      user.quote = quote;
      const data = await this.userRepository.save(user);
    } else {
      //uporabnik je posodobil quote
      const quote = await this.quoteRepository.findOne({ id: user.quote_id });
      quote.content = payload.content;

      const updatedQuote = await this.quoteRepository.save(quote);
    }
    return 'OK';
  }

  async upvote(id: number) {
    //id == userId
    //returnat more stevilo votov

    const upvoteQuery =
      'Update quotes set votes = votes + 1 where id=(select users.quote_id from users where id=' +
      id +
      ') returning quotes.votes';

    const votes = await this.quoteRepository.query(upvoteQuery);
    return votes[0][0].votes;
  }
}
