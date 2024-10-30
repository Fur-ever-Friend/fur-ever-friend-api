import { ForbiddenException, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { AccountState, User } from '@prisma/client';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {

    constructor(private authService: AuthService) {
        super({ usernameField: 'email' });
    }

    async validate(email: string, password: string): Promise<Partial<User>> {
        const user = await this.authService.validateLogin(email, password);

        if (user.accountStatus !== AccountState.ACTIVE) {
            throw new ForbiddenException('Account is not active');
        }

        return user;
    }

}
