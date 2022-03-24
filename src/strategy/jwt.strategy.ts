import { Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: (req) => {
        var token = null;
        if (req && req.cookies) {
          token = req.cookies['jwt'];
        }
        return token;
      },
      ignoreExpiration: false,
      secretOrKey: process.env.ACCESS_SECRET,
    });
  }

  async validate(payload: any) {
    //tuki lahka kličeš bazo da pošlješ dodatne info o uporabniku, ki niso v paylodou
    return {
      id: payload.id,
      email: payload.email,
    };
  }
}
