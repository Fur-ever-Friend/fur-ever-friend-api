import {
    BadRequestException,
    Body,
    Controller,
    Get,
    HttpStatus,
    Param,
    Patch,
    Post,
    Query,
    Req,
    UseGuards
} from '@nestjs/common';
import { UserService } from './users.service';
import { Request } from 'express';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { UpdateUserWithRoleDto } from './dto/update-petsitter.dto';
import { User } from '@prisma/client';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) { }

    // @Post() // POST /users?role={ROLE}  - Create a new user
    // async createUser(@Query("role") role: string, @Body() data: CreateUserDto) {
    //     if (role === undefined) throw new BadRequestException('Role is required');
    //     const response = await this.userService.createUser(role.toUpperCase(), data);
    //     return {
    //         statusCode: HttpStatus.CREATED,
    //         message: 'User created',
    //         data: response,
    //     }
    // }

    // for test // POST /users/:email  - Create a new petsitter
    @Post(":email")
    async createPetsitter(@Param("email") email: string) {
        const response = await this.userService.createPetsitter(email);
        return {
            statusCode: HttpStatus.CREATED,
            message: 'Create Petsitter Successfully',
            data: response,
        }
    }

    // move to admin controller
    // @Get() // GET /users  - Get all users
    // async getUsers(@Query("role") role: string) {
    //     if (role === undefined) role = "ALL";
    //     const response = await this.userService.getUsersByRole(role.toUpperCase());
    //     return {
    //         statusCode: HttpStatus.OK,
    //         message: 'Users found',
    //         data: response,
    //     }
    // }

    @UseGuards(JwtAuthGuard)
    @Get("me") // GET /users/me  - Get current user
    getCurrentUser2(@CurrentUser() user: User) {
        const { password, refreshToken, ...rest } = user;
        return {
            statusCode: HttpStatus.OK,
            message: 'User Founded',
            data: rest,
        }
    }

    @Patch('update/:userId') // PATCH /users/update/:userId  - Update user with role
    async updateUserWithRole(
        @Param('userId') userId: string,
        @Body() data: UpdateUserWithRoleDto,
    ) {
        let response = {};
        data.role = data.role.toUpperCase();
        if (["CUSTOMER", "ADMIN"].includes(data.role.toUpperCase())) {
            response = await this.userService.updateUser(userId, data);
        } else if (data.role.toUpperCase() === "PETSITTER") {
            response = await this.userService.updatePetsitter(userId, data.petsitterData);
        } else {
            throw new BadRequestException('Invalid role');
        }

        return {
            statusCode: HttpStatus.OK,
            message: "Update User Successfully",
            data: response,
        }
    }

    @Get(":userId") // GET /users/:userId  - Get user by id
    async getUserById(@Param("userId") userId: string) {
        const user = await this.userService.getUserById(userId);
        return {
            statusCode: HttpStatus.OK,
            message: 'User Founded',
            data: user,
        }
    }

}
