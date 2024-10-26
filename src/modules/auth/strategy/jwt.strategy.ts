import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../dto';
import { Request } from 'express';
import { AuthService } from '../auth.service';
import { User } from '@prisma/client';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(private readonly authService: AuthService) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([(req: Request) => {
                return req?.cookies?.accessToken;
            }]),
            ignoreExpiration: false,
            secretOrKey: process.env.ACCESS_TOKEN_SECRET,
        });
    }

    async validate(payload: JwtPayload): Promise<Partial<User>> {
        return this.authService.validateUser(payload);
    }
}
