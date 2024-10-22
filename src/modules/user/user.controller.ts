import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    HttpException,
    HttpStatus,
    NotFoundException,
    Param,
    Patch,
    Post,
    Put,
    Query,
    UploadedFile,
    UploadedFiles,
    UseGuards,
    UseInterceptors
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { UpdatePetsitterDto, UpdatePetsitterDtoSchema, UpdateUserDto, UpdateUserDtoSchema } from './dto/update-petsitter.dto';
import { Role, User } from '@prisma/client';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { UserQueryDto } from './dto/user-query-param.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { SetUserStatusDto } from './dto/set-user-status.dto';
import { diskStorage } from 'multer';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { checkFileNameEncoding, generateRandomFileName } from 'src/common/utils';
import { v4 as uuidV4 } from 'uuid';

@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Post("petsitter/:email")
    async createPetsitter(@Param("email") email: string) {
        const response = await this.userService.createPetsitter(email);
        return {
            statusCode: HttpStatus.CREATED,
            message: 'Create Petsitter Successfully',
            data: response,
        }
    }

    @Roles(Role.ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Get() // GET /users  - Get all users
    async getUsers(@Query() queryParams: UserQueryDto) {
        return this.userService.findAllUsers(queryParams);
    }

    @UseGuards(JwtAuthGuard)
    @Get("me") // GET /users/me  - Get current user
    getCurrentUser(@CurrentUser() user: User) {
        const { password, refreshToken, ...rest } = user;
        return {
            statusCode: HttpStatus.OK,
            message: 'User Founded',
            data: rest,
        }
    }

    @Patch('petsitter/:id')
    @UseInterceptors(
        FileFieldsInterceptor([
            { name: 'coverImage', maxCount: 5 },
            { name: 'avatar', maxCount: 1 },
        ], {
            storage: diskStorage({
                destination: './uploads',
                filename: (_, file, cb) => {
                    const [originalFilename, fileExt] = file.originalname.split('.');
                    const extension = file.mimetype.split("/")[1];
                    const id = uuidV4();
                    let filename: string;
                    if (!checkFileNameEncoding(originalFilename)) filename = `${id}-${generateRandomFileName()}.${extension}`;
                    else filename = `${originalFilename}-${id}.${fileExt}`;
                    cb(null, filename);
                },
            }),
            limits: { fileSize: 10 * 1024 * 1024 },
            fileFilter: (_, file, cb) => {
                if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
                    return cb(new BadRequestException('Only image files are allowed!'), false);
                }
                cb(null, true);
            },
        }),
    )
    async updatePetsitter(
        @Param('id') userId: string,
        @Body('json') json: string,
        @UploadedFiles() files: { avatar?: Express.Multer.File[], coverImage?: Express.Multer.File[] },
    ) {
        try {
            if (!json) throw new BadRequestException('No JSON data provided');
            const jsonParse = JSON.parse(json);
            const validateData = UpdatePetsitterDtoSchema.safeParse(jsonParse);
            if (!validateData.success) throw new BadRequestException('Invalid Field');

            const updatePetsitterDto = validateData.data as UpdatePetsitterDto;

            if (files.avatar && files.avatar[0]) {
                updatePetsitterDto.avatar = files.avatar[0].filename;
            }

            if (files.coverImage) {
                const newCoverImages = files.coverImage.map(file => file.filename);
                const oldCoverImages = updatePetsitterDto.petsitterData?.coverImages || [];
                if (oldCoverImages.length + newCoverImages.length > 5) {
                    throw new BadRequestException('Cover images exceed 5 images');
                }

                updatePetsitterDto.petsitterData = {
                    ...updatePetsitterDto.petsitterData,
                    coverImages: [...oldCoverImages, ...newCoverImages],
                }
            }

            const response = await this.userService.updatePetsitter(userId, updatePetsitterDto);
            return {
                statusCode: HttpStatus.OK,
                message: 'Update Petsitter Successfully',
                data: response,
            };
        } catch (error) {
            console.error(`[ERROR]`, error);
            if (error instanceof SyntaxError) throw new BadRequestException('Invalid JSON format');
            if (error instanceof HttpException) throw error;
            throw new BadRequestException('Invalid Field');
        }
    }

    @Patch('/customer/:id')
    @UseInterceptors(
        FileInterceptor('avatar', {
            storage: diskStorage({
                destination: './uploads',
                filename: (req, file, cb) => {
                    const [originalFilename, fileExt] = file.originalname.split('.');
                    const extension = file.mimetype.split("/")[1];
                    const id = uuidV4();
                    let filename: string;
                    if (!checkFileNameEncoding(originalFilename)) filename = `${id}-${generateRandomFileName()}.${extension}`;
                    else filename = `${originalFilename}-${id}.${fileExt}`;
                    cb(null, filename);
                },
            }),
            limits: { fileSize: 10 * 1024 * 1024 },
            fileFilter: (_, file, cb) => {
                if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
                    return cb(new BadRequestException('Only image files are allowed!'), false);
                }
                cb(null, true);
            },
        }),
    )
    async updateCustomer(
        @Param('id') userId: string,
        @Body("json") jsonData: string,
        @UploadedFile() avatarFile: Express.Multer.File,
    ) {
        try {
            const jsonParse = JSON.parse(jsonData);
            const validateData = UpdateUserDtoSchema.safeParse(jsonParse);
            if (!validateData.success) throw new BadRequestException("Invalid Field");

            const updateUserDto = validateData.data as UpdateUserDto;

            if (avatarFile) {
                updateUserDto.avatar = avatarFile.filename;
            }

            const response = await this.userService.updateUser(userId, updateUserDto);
            return {
                statusCode: HttpStatus.OK,
                message: 'Update Customer Successfully',
                data: response,
            }
        } catch (error) {
            console.log("[ERROR]", error);
            if (error instanceof SyntaxError) throw new BadRequestException("Invalid JSON format");
            else if (error instanceof HttpException) throw error;
            else throw new BadRequestException("Invalid Field");
        }
    }

    @UseGuards(JwtAuthGuard)
    @Get(":userId") // GET /users/:userId  - Get user by id
    async getUserById(@Param("userId") userId: string, @CurrentUser() user: User) {
        if (user.role === Role.ADMIN) {
            return this.userService.getUserByIdWithDetails(userId);
        } else {
            const response = await this.userService.getUserByIdWithoutCredential(userId);
            if (user.role === response.role) throw new NotFoundException('User not found'); //same role cannot see each other
            return {
                statusCode: HttpStatus.OK,
                message: "User Founded",
                data: response,
            }
        }
    }

    @Roles(Role.ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Put("set-state/:userId") // PUT /users/status/:userId
    async setUserState(@Param("userId") userId: string, @Body() setUserStatusDto: SetUserStatusDto) {
        await this.userService.setUserState(userId, setUserStatusDto.state);
        return {
            statusCode: HttpStatus.OK,
            message: 'User state updated',
        }
    }

    @Roles(Role.ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Delete(":userId") // DELETE /users/:userId
    async deleteUser(@Param("userId") userId: string) {
        await this.userService.deleteUser(userId, true);
        return {
            statusCode: HttpStatus.OK,
            message: 'User deleted',
        }
    }

    @UseGuards(JwtAuthGuard)
    @Delete("me") // DELETE /users/me
    async deleteCurrentUser(@CurrentUser() user: User) {
        await this.userService.deleteUser(user.id, false);
        return {
            statusCode: HttpStatus.OK,
            message: 'User deleted',
        }
    }

}
