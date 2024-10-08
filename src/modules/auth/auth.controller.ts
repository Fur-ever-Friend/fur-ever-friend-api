import { Controller, Post, Req, UseGuards, Res, HttpCode, HttpStatus, Body, ForbiddenException, UnauthorizedException, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import { User } from '@prisma/client';
import { CreateUserDto } from '../users/dto/create-user.dto';
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
      message: 'Register Successful',
      data: {
        user,
        token
      }
    });
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Req() req: Request, @Res() res: Response) {
    const { id: userId, role, ...rest } = req.user as Omit<User, 'password'>
    const { accessToken, refreshToken } = await this.authService.login({ userId, role })
    res.cookie('accessToken', accessToken, { httpOnly: true, maxAge: 1000 * 60 * 5 })
    res.cookie('refreshToken', refreshToken, { httpOnly: true, maxAge: 1000 * 60 * 60 })
    return res.json({
      statusCode: HttpStatus.OK,
      message: 'Login Successful',
      data: {
        user: {
          ...rest,
          id: userId,
          role,
          refreshToken,
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
    const { id } = req.user as Omit<User, 'password'>;
    await this.authService.logout(id)
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    return res.json({
      statusCode: HttpStatus.OK,
      message: 'Logout Successful',
    });
  }

  @UseGuards(RefreshJwtAuthGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) throw new ForbiddenException();
    const user = req.user as User;
    if (!user || !user.refreshToken) throw new UnauthorizedException();
    const token = await this.authService.refreshTokens(user.id, refreshToken);
    res.cookie('accessToken', token.accessToken, { httpOnly: true, maxAge: 1000 * 60 * 5 });
    res.cookie('refreshToken', token.refreshToken, { httpOnly: true, maxAge: 1000 * 60 * 60 });
    const { password, ...rest } = user;
    return res.json({
      user: rest,
      token
    });
  }

}
