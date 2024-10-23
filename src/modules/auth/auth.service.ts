import { BadRequestException, ForbiddenException, HttpException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { handleError, validatePassword } from 'src/common/utils';
import { Role, User } from '@prisma/client';
import { JwtPayload } from './dto';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { AuthResponseDto } from './dto/auth-response.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly userService: UserService,
    ) { }

    async validateLogin(email: string, pass: string): Promise<Partial<User>> {
        try {
            const user = await this.userService.getUserByEmail(email);
            if (await validatePassword(pass, user.password)) {
                const { password, ...result } = user;
                return result;
            }
            throw new BadRequestException("Invalid email or password");
        } catch (err: unknown) {
            if (err instanceof HttpException) {
                console.log(`[${err.name}] Code: ${err.getStatus()} Message: ${err.message}`);
                throw err;
            } else if (err instanceof Error) {
                console.log(`[${err.name}] ${err.message}`);
            } else {
                console.log("[ERROR]", err);
            }
            throw err;
        }
    }

    async validateUser(payload: { sub: string, role: Role }): Promise<Partial<User>> {
        try {
            const user = await this.userService.getUserByIdWithDetails(payload.sub);
            if (user.role !== payload.role) throw new ForbiddenException();
            const { password, ...result } = user;
            return result;
        } catch (err: unknown) {
            if (err instanceof HttpException) {
                console.log(`[${err.name}] Code: ${err.getStatus()} Message: ${err.message}`);
                throw err;
            } else if (err instanceof Error) {
                console.log(`[${err.name}] ${err.message}`);
            } else {
                console.log("[ERROR]", err);
            }
            throw new BadRequestException();
        }
    }

    async register(createUserDto: CreateUserDto): Promise<AuthResponseDto> {
        try {
            const user = await this.userService.createUser(createUserDto);
            const token = await this.getTokens(user.id, user.role);
            await this.userService.updateRefreshToken(user.id, token.refreshToken);
            return {
                user,
                token
            }
        } catch (err: unknown) {
            if (err instanceof HttpException) {
                console.log(`[${err.name}] Code: ${err.getStatus()} Message: ${err.message}`);
                throw err;
            } else if (err instanceof Error) {
                console.log(`[${err.name}] ${err.message}`);
            } else {
                console.log("[ERROR]", err);
            }
            throw new BadRequestException();
        }
    }

    async login({ userId, role }: { userId: string, role: Role }): Promise<{ accessToken: string, refreshToken: string }> {
        try {
            const tokens = await this.getTokens(userId, role);
            await this.userService.updateRefreshToken(userId, tokens.refreshToken);
            return tokens;
        } catch (err: unknown) {
            if (err instanceof HttpException) {
                throw err;
            } else if (err instanceof Error) {
                console.log(`[${err.name}] ${err.message}`);
            } else {
                console.log("[ERROR]", err);
            }
            throw new BadRequestException();
        }
    }

    async logout(userId: string): Promise<void> {
        try {
            await this.userService.updateRefreshToken(userId, null);
        } catch (err: unknown) {
            handleError(err, "logout");
        }
    }

    async refreshTokens(userId: string, refreshToken: string) {
        try {
            const user = await this.userService.getUserByIdWithDetails(userId);
            if (!user || !user.refreshToken) throw new ForbiddenException('Access Denied');
            if (refreshToken !== user.refreshToken) throw new ForbiddenException('Access Denied');
            const tokens = await this.getTokens(user.id, user.role);
            await this.userService.updateRefreshToken(user.id, tokens.refreshToken);
            return tokens;
        } catch (err: unknown) {
            if (err instanceof HttpException) {
                throw err;
            } else if (err instanceof Error) {
                console.log(`[${err.name}] ${err.message}`);
            } else {
                console.log("[ERROR]", err);
            }
            throw new ForbiddenException();
        }
    }

    async getTokens(userId: string, role: Role) {
        try {
            const nbf = Math.floor(Date.now() / 1000) + 30;
            const payload: JwtPayload = { sub: userId, role };
            const payloadWithNbf = { ...payload, nbf };
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
        } catch (err: unknown) {
            if (err instanceof Error) {
                console.log(`[${err.name}] ${err.message}`);
            } else {
                console.log("[ERROR]", err);
            }
            throw new InternalServerErrorException();
        }
    }
}
