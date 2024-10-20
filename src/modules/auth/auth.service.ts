import { BadRequestException, ForbiddenException, HttpException, HttpStatus, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { validatePassword, verify } from 'src/common/utils';
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

    async validateLogin(email: string, pass: string): Promise<Omit<User, 'password'>> {
        try {
            const user = await this.userService.getUserByEmail(email);
            if (await validatePassword(pass, user.password)) {
                const { password, ...result } = user;
                return result;
            }
            throw new BadRequestException("Invalid email or password");
        } catch (error) {
            if (error instanceof HttpException) {
                console.log(`[HttpException] Code: ${error.getStatus()} Message: ${error.message}`);
                throw error;
            } else {
                console.log("[ERROR]", error);
                throw new InternalServerErrorException()
            }
        }
    }

    async validateUser(payload: { sub: string, role: Role }): Promise<Omit<User, 'password'>> {
        try {
            const user = await this.userService.getUserById(payload.sub);
            if (user.role !== payload.role) throw new ForbiddenException();
            const { password, ...result } = user;
            return result;
        } catch (err) {
            if (err instanceof HttpException) {
                throw err;
            } else {
                console.log("[ERROR]", err);
                throw new HttpException("Internal Server Error", HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }

    async register(createUserDto: CreateUserDto): Promise<AuthResponseDto> {
        try {
            const user = await this.userService.createUser(createUserDto);
            const tokens = await this.getTokens(user.id, user.role);
            await this.userService.updateRefreshToken(user.id, tokens.refreshToken);
            user.refreshToken = tokens.refreshToken;
            return {
                user,
                token: tokens
            }
        } catch (err) {
            throw err
        }
    }

    async login({ userId, role }: { userId: string, role: Role }): Promise<{ accessToken: string, refreshToken: string }> {
        try {
            const tokens = await this.getTokens(userId, role);
            await this.userService.updateRefreshToken(userId, tokens.refreshToken);
            return tokens;
        } catch (err) {
            if (err instanceof HttpException) {
                throw err;
            } else {
                console.log("[ERROR]", err);
                throw new HttpException("Internal Server Error", HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }

    async logout(userId: string): Promise<void> {
        try {
            await this.userService.getUserById(userId);
            await this.userService.updateRefreshToken(userId, null);
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            } else {
                console.log("[ERROR]", error);
                throw new HttpException("Internal Server Error", HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }

    async refreshTokens(userId: string, refreshToken: string) {
        try {
            const user = await this.userService.getUserById(userId);
            if (!user || !user.refreshToken) throw new ForbiddenException('Access Denied');
            if (refreshToken !== user.refreshToken) throw new ForbiddenException('Access Denied');
            // const refreshTokenMatches = await verify(refreshToken, user.refreshToken);
            // console.log(`[DEBUG] Refresh Token Matches: ${refreshTokenMatches}`);
            // if (!refreshTokenMatches) throw new ForbiddenException('Access Denied');
            const tokens = await this.getTokens(user.id, user.role);
            await this.userService.updateRefreshToken(user.id, tokens.refreshToken);
            return tokens;
        } catch (err) {
            if (err instanceof HttpException) {
                throw err;
            } else {
                console.log("[ERROR]", err);
                throw new HttpException("Internal Server Error", HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }

    async getTokens(userId: string, role: Role) {
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
    }
}
