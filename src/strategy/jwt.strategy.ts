import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly userService: AuthService) {
    super({
      jwtFromRequest: (req) => {
        var token = null;
        if (req && req.cookies) {
          token = req.cookies['jwt'];
        }
        return token;
      },
      ignoreExpiration: true,
      secretOrKey: 'yo',
    });
  }

  async validate(payload: any) {
    //tuki lahka kličeš bazo da pošlješ dodatne info o uporabniku, ki niso v paylodou
    console.log(payload);
    return {
      id: payload.userId,
      username: payload.username,
    };
  }
}
