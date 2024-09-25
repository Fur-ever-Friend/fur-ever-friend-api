import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { UserService } from './users.service';
import { Role } from '@prisma/client';
import { Request } from 'express';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';

@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Post()
    createUser(@Body() body: CreateUserDto) {
        return this.userService.createUser(body);
    }

    @Post(":email")
    createPetsitter(@Param("email") email: string) {
        return this.userService.createPetsitter(email);
    }

    @Get()
    getUsers() {
        return this.userService.getUsers();
    }

    @UseGuards(JwtAuthGuard)
    @Get("me")
    getCurrentUser(@Req() req: Request) {
        const user = req.user;
        return {
            statusCode: 200,
            message: 'User found',
            data: user,
        }
    }

    @Get("role/:role")
    getUsersByRole(@Param("role") role: Role) {
        return this.userService.getUsersByRole(role);
    }

    @Get(":userId")
    getUserById(@Param("userId") userId: string) {
        return this.userService.getUserById(userId);
    }


}
