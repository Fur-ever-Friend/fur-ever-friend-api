import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { UserService } from './users.service';
import { Role, User } from '@prisma/client';
import { Request } from 'express';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { JwtPayload } from '../auth/dto';
export interface CustomRequest extends Request {
    user: JwtPayload;  // Add the user property here
}

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
    async getCurrentUser(@Req() req: CustomRequest) {
        const { sub: userId, role } = req.user;
        console.log("userId", userId);
        console.log("role", role);
        const { password, ...result } = await this.userService.getUserById(userId);
        return {
            statusCode: 200,
            message: 'User found',
            data: result,
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
