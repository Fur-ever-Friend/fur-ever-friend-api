import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { User } from '@prisma/client';
import { LoginSchema } from '../dto';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {

    constructor(private authService: AuthService) {
        super({ usernameField: 'email' });
    }

    async validate(email: string, password: string): Promise<Partial<User>> {
        try {
            const authValidate = LoginSchema.parse({ email, password });
            const user = await this.authService.validateLogin(authValidate.email, authValidate.password);
            return user;
        } catch (err: unknown) {
            if (err instanceof HttpException) {
                console.log(`Error: ${err.message}`);
                throw err;
            } else if (err instanceof Error) {
                console.log(`Error: ${err.message}`);
            }
            throw new BadRequestException("Invalid email or password.");

        }
    }

}
