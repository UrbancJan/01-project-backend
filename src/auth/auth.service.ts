import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from 'src/dto/create-user.dto';
import { LoginUserDto } from 'src/dto/login-user.dto';
import { User } from 'src/Entity/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  signup(payload: CreateUserDto): Promise<User> {
    const user = new User();

    user.email = payload.email;
    user.name = payload.name;
    user.lastname = payload.lastname;
    user.password = payload.password;

    return this.userRepository.save(user);
  }

  async login(payload: LoginUserDto): Promise<string> {
    const user = await this.userRepository.findOne({
      email: payload.email,
    });
    if (!user) {
      throw new UnauthorizedException('invalid credentials');
    }

    if (user.password !== payload.password) {
      throw new UnauthorizedException('invalid credentials');
    }

    const tempToken = await this.signUser(user.id, user.email);

    return tempToken;
  }

  async signUser(userId: number, username: string) {
    return this.jwtService.signAsync({
      userId,
      username,
    });
  }
}
