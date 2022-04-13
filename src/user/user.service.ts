import {
  BadRequestException,
  Injectable,
  NotAcceptableException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NewPasswordDto } from 'src/dto/new-password.dto';
import { NewQuoteDto } from 'src/dto/new-quote.dto';
import { Quote } from 'src/Entity/quote.entity';
import { User } from 'src/Entity/user.entity';
import { createQueryBuilder, IsNull, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Vote } from 'src/Entity/vote.entity';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Quote)
    private readonly quoteRepository: Repository<Quote>,
    @InjectRepository(Vote) private readonly voteRepository: Repository<Vote>,
  ) {}

  async me(userId: number): Promise<User> {
    const user = await this.userRepository.findOne(userId, {
      relations: ['quote'],
    });

    //pogledamo če uporabnik obstaja
    if (!user) {
      throw new NotFoundException('User does not exist');
    }

    return user;
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

  async upvote(loggedInUserId: number, userId: number): Promise<any> {
    //interface za objekte, ki jih bomo vračali
    interface returnObject {
      votes?: number;
      state?: number;
    }

    var holdState;
    /*const user = await this.userRepository.findOne(userId, {
      relations: ['quote'],
    });*/
    const user = await this.userRepository.findOne({
      where: { quote_id: userId },
    });

    //pogledamo če uporabnik obstaja
    if (!user) {
      throw new NotFoundException('User does not exist');
    }

    //pogledamo če ima uporabnik quote
    if (user.quote_id === null) {
      throw new BadRequestException('User does not have a quote');
    }

    //najdemo quote
    const quote = await this.quoteRepository.findOne({
      id: user.quote_id,
    });

    //pogledamo če je prijavljen uporabnik že glasoval ne temu quotu
    //state=1 => upvote / state=2 => downvote / state=undefined => ni se oddal glasu
    const state = await this.voteRepository.findOne({
      where: { user_id: loggedInUserId, quote_id: quote.id },
    });

    //najdemo logged in user info
    const loggedInUser = await this.userRepository.findOne(loggedInUserId);
    if (!state) {
      quote.votes = quote.votes + 1;
      const newVote = new Vote();
      newVote.state = 1;
      newVote.quote = quote;
      newVote.user = loggedInUser;
      holdState = 1;
      await this.voteRepository.save(newVote);
    } else if (state.state === 1) {
      //če uporabnik upvota že upvotan quote se vote odstrani
      quote.votes = quote.votes - 1;
      state.state = 0;
      holdState = 0;
      await this.voteRepository.save(state);
    } else if (state.state === 0) {
      //uporabnik je že upvotu ampak je upvote odstranil in želi ponovno upvotat
      quote.votes = quote.votes + 1;
      state.state = 1;
      holdState = 1;
      await this.voteRepository.save(state);
    } else if (state.state === 2) {
      //uporabnik je downvotu in sedaj želi upvotat
      state.state = 1;
      state.quote = quote;
      state.user = loggedInUser;
      quote.votes = quote.votes + 2;
      holdState = 1;
      await this.voteRepository.save(state);
    }
    const newValue = await this.quoteRepository.save(quote);

    var returnValue: returnObject = {
      votes: newValue.votes,
      state: holdState,
    };

    return returnValue;
    //return newValue.votes;
  }

  async downvote(loggedInUserId: number, userId: number): Promise<any> {
    //interface za objekte, ki jih bomo vračali
    interface returnObject {
      votes?: number;
      state?: number;
    }

    var holdState;
    const user = await this.userRepository.findOne({
      where: { quote_id: userId },
    });

    //pogledamo če uporabnik obstaja
    if (!user) {
      throw new NotFoundException('User does not exist');
    }

    //pogledamo če ima uporabnik quote
    if (user.quote_id === null) {
      throw new BadRequestException('User does not have a quote');
    }

    //najdemo quote
    const quote = await this.quoteRepository.findOne({
      id: user.quote_id,
    });

    //pogledamo če je prijavljen uporabnik že glasoval ne temu quotu
    //state=1 => upvote / state=2 => downvote / state=undefined => ni se oddal glasu
    const state = await this.voteRepository.findOne({
      where: { user_id: loggedInUserId, quote_id: quote.id },
    });

    //najdemo logged in user info
    const loggedInUser = await this.userRepository.findOne(loggedInUserId);

    if (!state) {
      quote.votes = quote.votes - 1;
      const newVote = new Vote();
      newVote.state = 2;
      newVote.quote = quote;
      newVote.user = loggedInUser;
      holdState = 2;
      await this.voteRepository.save(newVote);
    } else if (state.state === 2) {
      //če uporabnik dovnwota že downvotan quote se vote odstrani
      quote.votes = quote.votes + 1;
      state.state = 0;
      holdState = 0;
      await this.voteRepository.save(state);
    } else if (state.state === 0) {
      //uporabnik je že downvotu ampak je dovnwote odstranil in želi ponovno dovnwotat
      quote.votes = quote.votes - 1;
      state.state = 2;
      holdState = 2;
      await this.voteRepository.save(state);
    } else if (state.state === 1) {
      //uporabnik je upvotu in sedaj želi downvotat
      state.state = 2;
      state.quote = quote;
      state.user = loggedInUser;
      quote.votes = quote.votes - 2;
      holdState = 2;
      await this.voteRepository.save(state);
    }

    const newValue = await this.quoteRepository.save(quote);
    var returnValue: returnObject = {
      votes: newValue.votes,
      state: holdState,
    };

    return returnValue;
    //return newValue.votes;
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

    //pogledamo če se gesli ujemata
    if (!(newPassword.password === newPassword.confirmPassword)) {
      throw new UnprocessableEntityException('Passwords do not match!');
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

  //todo popravi da se id pošlje v url zato da dobim liked posts od drugih userjev ne samo od trenutno prijavljenega
  async liked(userId: number): Promise<User[]> {
    //todo najdi samo tiste kjer je glasoval z upvotu
    /*const selectQuery =
      'select u.id as op_user_id, u.name as name, u.lastname as lastname, q.id as quote_id, q.content as content, v.state as state from votes v inner join quotes q on v.quote_id=q.id inner join users u on q.id=u.quote_id where v.user_id=' +
      userId +
      'and v.state=1;';*/

    /*const selectQuery =
      'select u.*, q.* from votes v inner join quotes q on v.quote_id=q.id inner join users u on q.id=u.quote_id where v.user_id=' +
      userId +
      'and v.state=1;';*/

    const data = await this.userRepository
      .createQueryBuilder('u')
      .innerJoinAndSelect('u.quote', 'q')
      .innerJoin(Vote, 'v', 'v.quote=q.id')
      .where('v.user_id=' + userId)
      .andWhere('v.state = 1') //state = 1 -> upvote
      .getMany();

    /*const result = await this.quoteRepository.query(selectQuery);
    if (!result) {
      throw new NotFoundException('User does not have any liked quotes!');
    }
    */
    //console.log(data);
    /*var data = Array.from(result);
    console.log(data);*/

    return data;
  }

  async randomQuote(): Promise<User> {
    const user = await this.userRepository
      .createQueryBuilder('u')
      .innerJoinAndSelect('u.quote', 'q')
      .orderBy('RANDOM()')
      .limit(1)
      .getOne();

    if (!user) {
      throw new NotFoundException('User does not exist');
    }

    return user;
  }
}
