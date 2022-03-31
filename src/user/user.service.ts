import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NewPasswordDto } from 'src/dto/new-password.dto';
import { NewQuoteDto } from 'src/dto/new-quote.dto';
import { Quote } from 'src/Entity/quote.entity';
import { User } from 'src/Entity/user.entity';
import { IsNull, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Vote } from 'src/Entity/vote.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Quote)
    private readonly quoteRepository: Repository<Quote>,
    @InjectRepository(Vote) private readonly voteRepository: Repository<Vote>,
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

  async upvote(loggedInUserId: number, userId: number): Promise<Number> {
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

    //najdemo quote in dodamo +1
    const quote = await this.quoteRepository.findOne({
      id: user.quote_id,
    });
    quote.votes = quote.votes + 1;

    //pogledamo če je prijavljen uporabnik že glasoval ne temu quotu
    //state=1 => upvote / state=2 => downvote / state=undefined => ni se oddal glasu
    //const vote = new Vote();
    //const state = await this.voteRepository.findOne({ id: loggedInUserId });
    const state = await this.voteRepository.findOne({
      where: { user_id: loggedInUserId, quote_id: quote.id },
    });

    //najdemo logged in user info
    const loggedInUser = await this.userRepository.findOne(loggedInUserId);

    if (!state) {
      //uporabnik še ni glasoval
      //state.user_id = loggedInUserId;
      const newVote = new Vote();
      newVote.state = 1;
      newVote.quote = quote;
      newVote.user = loggedInUser;
      await this.voteRepository.save(newVote);
    } else if (state.state === 1) {
      //uporabnik je že upvotu
      throw new BadRequestException('You have already voted on this quote');
    } else if (state.state === 2) {
      //uporabnik je downvotu in sedaj želi upvotat
      //state.user_id = loggedInUserId;
      state.state = 1;
      state.quote = quote;
      state.user = loggedInUser;
      await this.voteRepository.save(state);
    }

    const newValue = await this.quoteRepository.save(quote);
    return newValue.votes;

    /* const upvoteQuery =
      'Update quotes set votes = votes + 1 where id=(select users.quote_id from users where id=' +
      id +
      ') returning quotes.votes';

    const votes = await this.quoteRepository.query(upvoteQuery);
    return votes[0][0].votes;*/
  }

  async downvote(loggedInUserId: number, userId: number) {
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

    //najdemo quote in dodamo - 1
    const quote = await this.quoteRepository.findOne({
      id: user.quote_id,
    });
    quote.votes = quote.votes - 1;

    //pogledamo če je prijavljen uporabnik že glasoval ne temu quotu
    //state=1 => upvote / state=2 => downvote / state=undefined => ni se oddal glasu
    //const vote = new Vote();
    //const state = await this.voteRepository.findOne({ id: loggedInUserId });
    const state = await this.voteRepository.findOne({
      where: { user_id: loggedInUserId, quote_id: quote.id },
    });

    //najdemo logged in user info
    const loggedInUser = await this.userRepository.findOne(loggedInUserId);

    if (!state) {
      //uporabnik še ni glasoval
      //state.user_id = loggedInUserId;
      const newVote = new Vote();
      newVote.state = 2;
      newVote.quote = quote;
      newVote.user = loggedInUser;
      await this.voteRepository.save(newVote);
    } else if (state.state === 2) {
      //uporabnik je že downvotu
      throw new BadRequestException('You have already voted on this quote');
    } else if (state.state === 1) {
      //uporabnik je upvotu in sedaj želi downvotat
      //state.user_id = loggedInUserId;
      state.state = 2;
      state.quote = quote;
      state.user = loggedInUser;
      await this.voteRepository.save(state);
    }

    const newValue = await this.quoteRepository.save(quote);
    return newValue.votes;
  }

  async updatePassword(
    userId: number,
    newPassword: NewPasswordDto,
  ): Promise<any> {
    const user = await this.userRepository.findOne({ id: userId });
    //pogledamo če uporabnik obstaja
    if (!user) {
      throw new NotFoundException('User does not exist');
    }

    //pogledamo, če je staro geslo enako kot novo geslo
    if (await bcrypt.compare(newPassword.password, user.password)) {
      throw new BadRequestException(
        'New password can not be the same as the old one!',
      );
    }

    const saltOrRounds = 10;
    const hashedPassword = await bcrypt.hash(
      newPassword.password,
      saltOrRounds,
    );

    //user objektu nastavimo novo geslo in ga shranimo v bazo
    user.password = hashedPassword;

    await this.userRepository.save(user);

    //iz objekta odstranimo geslo da ne vračamo gesla uporabniku na client
    const { password, ...result } = user;
    return result;
  }

  async usersInfo(userId: number) {
    const user = await this.userRepository.findOne(userId, {
      relations: ['quote'],
    });

    //pogledamo če uporabnik obstaja
    if (!user) {
      throw new NotFoundException('User does not exist');
    }

    return user;
  }

  async list(): Promise<User[]> {
    const user = await this.userRepository
      .createQueryBuilder('users')
      .leftJoinAndSelect('users.quote', 'id')
      .orderBy('votes', 'DESC')
      .getMany();

    return user;
  }

  async liked(userId: number) {
    const selectQuery =
      'select u.id as op_user_id, u.name as name, u.lastname as lastname, q.id as quote_id, q.content as content from votes v inner join quotes q on v.quote_id=q.id inner join users u on q.id=u.quote_id where v.user_id=' +
      userId +
      ';';
    const result = await this.quoteRepository.query(selectQuery);
    console.log(result);
    return null;
  }
}
