import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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

  async me(userId: number): Promise<any> {
    const user = await this.userRepository.findOne({ id: userId });

    //iz objekta odstranimo geslo da ne vračamo gesla uporabniku na client
    const { password, ...result } = user;

    //pogledamo če uporabnik obstaja
    if (!user) {
      throw new NotFoundException('User does not exist');
    }

    return result;
  }

  async createUpdateQuote(payload: NewQuoteDto, userId: number): Promise<User> {
    //pridobimo uporabnika in njegov quote
    const user = await this.userRepository.findOne(userId, {
      relations: ['quote'],
    });

    //pogledamo če ima uporabnik quote
    if (user.quote_id === null) {
      const quote = new Quote();
      quote.content = payload.content;
      quote.votes = 0;
      await this.quoteRepository.save(quote);

      user.quote = quote;
      await this.userRepository.save(user);
    } else {
      const quote = await this.quoteRepository.findOne({
        id: user.quote_id,
      });
      quote.content = payload.content;
      await this.quoteRepository.save(quote);
    }

    return await this.userRepository.findOne(userId, {
      relations: ['quote'],
    });
  }

  async upvote(userId: number): Promise<Number> {
    const user = await this.userRepository.findOne(userId, {
      relations: ['quote'],
    });

    //pogledamo če uporabnik obstaja
    if (!user) {
      throw new NotFoundException('User does not exist');
    }

    //pogledamo če ima uporabnik quote
    if (user.quote_id === null) {
      throw new BadRequestException('User does not have a quote');
    }

    const quote = await this.quoteRepository.findOne({
      id: user.quote_id,
    });
    quote.votes = quote.votes + 1;
    const newValue = await this.quoteRepository.save(quote);

    return newValue.votes;

    /* const upvoteQuery =
      'Update quotes set votes = votes + 1 where id=(select users.quote_id from users where id=' +
      id +
      ') returning quotes.votes';

    const votes = await this.quoteRepository.query(upvoteQuery);
    return votes[0][0].votes;*/
  }

  async downvote(userId: number) {
    const user = await this.userRepository.findOne(userId, {
      relations: ['quote'],
    });

    //pogledamo če uporabnik obstaja
    if (!user) {
      throw new NotFoundException('User does not exist');
    }

    //pogledamo če ima uporabnik quote
    if (user.quote_id === null) {
      throw new BadRequestException('User does not have a quote');
    }

    const quote = await this.quoteRepository.findOne({
      id: user.quote_id,
    });
    quote.votes = quote.votes - 1;
    const newValue = await this.quoteRepository.save(quote);

    return newValue.votes;
  }
}
