import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards, ValidationPipe, Res, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto';
import { Request, Response } from 'express';
import { LocalAuthGuard } from './guard/local-auth.guard';
import { User } from '@prisma/client';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(200)
  async login(
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    loginUserDto: LoginDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const { id: userId, role } = req.user as Omit<User, 'password'>;
    const { accessToken } = await this.authService.login({ userId, role });
    res.cookie('accessToken', accessToken, { httpOnly: true });
    return res.json({
      statusCode: 200,
      message: 'Login successful',
      data: {
        user: req.user,
        token: accessToken,
      }
    });
  }

}
