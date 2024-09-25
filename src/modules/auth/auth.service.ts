import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../users/users.service';
import { validatePassword } from 'src/utils';
import { Role, User } from '@prisma/client';

@Injectable()
export class AuthService {
    constructor(
        private jwtService: JwtService,
        private readonly userService: UserService,
    ) { }

    async validateUser(email: string, pass: string): Promise<Omit<User, 'password'>> {
        if (typeof email !== 'string' || !email.includes('@')) {
            throw new BadRequestException('Invalid email format');
        }
        const user = await this.userService.getUserByEmail(email);
        if (!user) throw new NotFoundException("email not found");
        if (await validatePassword(pass, user.password)) {
            const { password, ...result } = user;
            return result;
        } else throw new BadRequestException("Invalid email or password");

    }

    async login({ userId, role }: { userId: string, role: Role }): Promise<{ accessToken: string }> {
        const payload = { sub: userId, role };
        return {
            accessToken: this.jwtService.sign(payload),
        };
    }
}
