import { Controller, Post, Req, UseGuards, Res, HttpCode, HttpStatus, Body, ForbiddenException, UnauthorizedException, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import { User } from '@prisma/client';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { LocalAuthGuard } from './guard/local-auth.guard';
import { RefreshJwtAuthGuard } from './guard/refresh-auth.guard';
import { JwtAuthGuard } from './guard/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() createUserDto: CreateUserDto, @Res() res: Response) {
    const { token, user } = await this.authService.register(createUserDto)
    res.cookie('accessToken', token.accessToken, { httpOnly: true, maxAge: 1000 * 60 * 5 })
    res.cookie('refreshToken', token.refreshToken, { httpOnly: true, maxAge: 1000 * 60 * 60 })
    return res.json({
      statusCode: HttpStatus.CREATED,
      message: "Welcome aboard! Your account has been created successfully.",
      data: {
        user,
        token: {
          accessToken: token.accessToken,
        }
      }
    });
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Req() req: Request, @Res() res: Response) {
    const { id: userId, role, ...otherFields } = req.user as Partial<User>;
    const { accessToken, refreshToken } = await this.authService.login({ userId, role })
    res.cookie('accessToken', accessToken, { httpOnly: true, maxAge: 1000 * 60 * 5 })
    res.cookie('refreshToken', refreshToken, { httpOnly: true, maxAge: 1000 * 60 * 60 })
    return res.json({
      statusCode: HttpStatus.OK,
      message: "Welcome back! You have logged in successfully.",
      data: {
        user: {
          id: userId,
          ...otherFields,
          role,
        },
        token: {
          accessToken,
        },
      },
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: Request, @Res() res: Response) {
    const { id } = req.user as Partial<User>;
    await this.authService.logout(id)
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    return res.json({
      statusCode: HttpStatus.OK,
      message: "Logout successful.",
    });
  }

  @UseGuards(RefreshJwtAuthGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies?.refreshToken;
    console.log("refreshToken", refreshToken);
    if (!refreshToken) throw new ForbiddenException();
    const user = req.user as Partial<User>;
    if (!user || !user.refreshToken) throw new UnauthorizedException();
    const token = await this.authService.refreshTokens(user.id, refreshToken);
    res.cookie('accessToken', token.accessToken, { httpOnly: true, maxAge: 1000 * 60 * 5 });
    res.cookie('refreshToken', token.refreshToken, { httpOnly: true, maxAge: 1000 * 60 * 60 });
    const { password, refreshToken: rt, ...otherFields } = user;
    return res.json({
      statusCode: HttpStatus.OK,
      message: "Token refreshed successfully.",
      data: {
        user: otherFields,
        token: {
          accessToken: token.accessToken,
        }
      }
    });
  }

}
