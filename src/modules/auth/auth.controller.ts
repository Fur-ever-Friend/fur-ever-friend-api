import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards, ValidationPipe, Res, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import { LocalAuthGuard } from './guard/local-auth.guard';
import { User } from '@prisma/client';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Req() req: Request, @Res() res: Response) {
    const { id: userId, role } = req.user as Omit<User, 'password'>;
    const { accessToken } = await this.authService.login({ userId, role });
    res.cookie('accessToken', accessToken, { httpOnly: true, maxAge: 1000 * 60 * 5 });
    return res.json({
      statusCode: HttpStatus.OK,
      message: 'Login successful',
      data: {
        user: req.user,
      }
    });
  }

}
