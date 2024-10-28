import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role, User } from '@prisma/client';

import { UserService } from '../user/user.service';
import { JwtPayload, AuthResponseDto } from './dto';
import { CreateUserDto } from '../user/dto';
import { validatePassword } from 'src/common/utils';

@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly userService: UserService,
    ) { }

    async validateLogin(email: string, pass: string): Promise<Partial<User>> {
        const user = await this.userService.getUserByEmail(email);
        if (await validatePassword(pass, user.password)) {
            const { password, ...result } = user;
            return result;
        }
        throw new BadRequestException("Invalid email or password");
    }

    async validateUser(payload: { sub: string, role: Role }): Promise<Partial<User>> {
        const user = await this.userService.getUserByIdWithDetails(payload.sub);
        if (user.role !== payload.role) throw new ForbiddenException();
        const { password, ...result } = user;
        return result;
    }

    async register(createUserDto: CreateUserDto): Promise<AuthResponseDto> {
        const user = await this.userService.createUser(createUserDto);
        const token = await this.getTokens(user.id, user.role);
        await this.userService.updateRefreshToken(user.id, token.refreshToken);
        return {
            user,
            token
        }
    }

    async login({ userId, role }: { userId: string, role: Role }): Promise<{ accessToken: string, refreshToken: string }> {
        const tokens = await this.getTokens(userId, role);
        await this.userService.updateRefreshToken(userId, tokens.refreshToken);
        return tokens;
    }

    async logout(userId: string): Promise<void> {
        await this.userService.updateRefreshToken(userId, null);
    }

    async refreshTokens(userId: string, refreshToken: string) {
        const user = await this.userService.getUserByIdWithDetails(userId);
        if (!user || !user.refreshToken) throw new ForbiddenException('Access Denied');
        if (refreshToken !== user.refreshToken) throw new ForbiddenException('Access Denied');
        const tokens = await this.getTokens(user.id, user.role);
        await this.userService.updateRefreshToken(user.id, tokens.refreshToken);
        return tokens;
    }

    async getTokens(userId: string, role: Role) {
        const nbf = Math.floor(Date.now() / 1000) + 30;
        const payload: JwtPayload = { sub: userId, role };
        const payloadWithNbf = { ...payload, nbf };
        console.log("exp", process.env.ACCESS_EXPIRES_IN);
        console.log("exp", process.env.REFRESH_EXPIRES_IN);
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, {
                secret: process.env.ACCESS_TOKEN_SECRET,
                expiresIn: process.env.ACCESS_EXPIRES_IN,
            },
            ),
            this.jwtService.signAsync(payloadWithNbf, {
                secret: process.env.REFRESH_TOKEN_SECRET,
                expiresIn: process.env.REFRESH_EXPIRES_IN,
            },
            ),
        ]);

        return {
            accessToken,
            refreshToken,
        }
    }
}
