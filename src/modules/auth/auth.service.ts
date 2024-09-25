import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
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

    async localValidate(email: string, pass: string): Promise<Omit<User, 'password'>> {
        const user = await this.userService.getUserByEmail(email);
        if (!user) throw new NotFoundException("email not found");
        if (await validatePassword(pass, user.password)) {
            const { password, ...result } = user;
            return result;
        } else throw new BadRequestException("Invalid email or password");

    }

    async validateUser(payload: { sub: string, role: Role }): Promise<Omit<User, 'password'>> {
        const user = await this.userService.getUserById(payload.sub);
        if (!user) throw new NotFoundException("email not found");
        if (user.role !== payload.role) throw new ForbiddenException();
        const { password, ...result } = user;
        return result;
    }

    async login({ userId, role }: { userId: string, role: Role }): Promise<{ accessToken: string }> {
        const payload = { sub: userId, role };
        return {
            accessToken: this.jwtService.sign(payload),
        };
    }
}
