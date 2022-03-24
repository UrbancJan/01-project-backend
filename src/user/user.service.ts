import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/Entity/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async me(id: number): Promise<any> {
    const user = await this.userRepository.findOne({ id: id });

    const { password, ...result } = user;

    return result;
  }
}
