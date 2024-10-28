import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
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
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Role, User } from '@prisma/client';
import { v4 as uuidV4 } from 'uuid';

import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { UserService } from './user.service';
import { SetUserStatusDto, UpdateCustomerSchema, UpdatePetsitterDto, UpdatePetsitterDtoSchema, UpdateUserDto, UpdateUserDtoSchema, UserQueryDto } from './dto';
import { checkFileNameEncoding, generateRandomFileName, handleError } from 'src/common/utils';

@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Roles(Role.ADMIN) // Create Petsitter by Admin
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Post("petsitter/:email")
    @HttpCode(HttpStatus.CREATED)
    async createPetsitter(@Param("email") email: string) {
        const result = await this.userService.createPetsitter(email);
        return {
            statusCode: HttpStatus.CREATED,
            message: 'Create Petsitter Successfully',
            data: result,
        }
    }

    @Roles(Role.ADMIN) // User Dashboard for Admin
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Get()
    async getUsers(@Query() queryParams: UserQueryDto) {
        const users = await this.userService.findAllUsers(queryParams);
        return {
            statusCode: HttpStatus.OK,
            message: 'Users retrieved successfully.',
            data: users,
        }
    }

    @UseGuards(JwtAuthGuard) // Get current user
    @Get("me")
    getCurrentUser(@CurrentUser() user: User) {
        const { password, refreshToken, accountStatus, createdAt, ...rest } = user;
        return {
            statusCode: HttpStatus.OK,
            message: 'User retrieved successfully.',
            data: rest,
        }
    }

    @Roles(Role.PETSITTER) // Update Petsitter by Petsitter
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Patch('petsitter/me')
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
                    if (!checkFileNameEncoding(originalFilename)) filename = `${generateRandomFileName()}-${id}.${extension}`;
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
    async updateCurrentPetsitter(
        @CurrentUser() { id: userId }: User,
        @Body('json') json: string,
        @UploadedFiles() files: { avatar?: Express.Multer.File[], coverImage?: Express.Multer.File[] },
    ) {
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

        const result = await this.userService.updatePetsitter(userId, updatePetsitterDto);
        return {
            statusCode: HttpStatus.OK,
            message: 'Update Petsitter Successfully',
            data: result,
        };
    }

    @Roles(Role.ADMIN) // Update Petsitter
    @UseGuards(JwtAuthGuard, RolesGuard)
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
                    if (!checkFileNameEncoding(originalFilename)) filename = `${generateRandomFileName()}-${id}.${extension}`;
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

        const result = await this.userService.updatePetsitter(userId, updatePetsitterDto);
        return {
            statusCode: HttpStatus.OK,
            message: 'Update Petsitter Successfully',
            data: result,
        };
    }

    @Roles(Role.CUSTOMER) // Update User by Customer
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Patch('customer/me')
    @UseInterceptors(
        FileInterceptor('avatar', {
            storage: diskStorage({
                destination: './uploads',
                filename: (req, file, cb) => {
                    const [originalFilename, fileExt] = file.originalname.split('.');
                    const extension = file.mimetype.split("/")[1];
                    const id = uuidV4();
                    let filename: string;
                    if (!checkFileNameEncoding(originalFilename)) filename = `${generateRandomFileName()}-${id}.${extension}`;
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
    async updateCurrentCustomer(
        @CurrentUser() { id: userId }: User,
        @Body("json") jsonStr: string,
        @UploadedFile() avatarFile: Express.Multer.File,
    ) {
        const jsonParse = JSON.parse(jsonStr);
        const validateData = UpdateCustomerSchema.parse(jsonParse);

        const updateUserDto = validateData as UpdatePetsitterDto;

        if (avatarFile) {
            updateUserDto.avatar = avatarFile.filename;
        }

        const result = await this.userService.updateCustomer(userId, updateUserDto);
        return {
            statusCode: HttpStatus.OK,
            message: "Customer updated successfully.",
            data: result,
        }
    }

    @Roles(Role.ADMIN) // Update Customer by Admin
    @UseGuards(JwtAuthGuard, RolesGuard)
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
                    if (!checkFileNameEncoding(originalFilename)) filename = `${generateRandomFileName()}-${id}.${extension}`;
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
        @Body("json") jsonStr: string,
        @UploadedFile() avatarFile: Express.Multer.File,
    ) {
        const jsonParse = JSON.parse(jsonStr);
        const validateData = UpdateUserDtoSchema.parse(jsonParse);

        const updateUserDto = validateData as UpdateUserDto;

        if (avatarFile) {
            updateUserDto.avatar = avatarFile.filename;
        }

        const result = await this.userService.updateUser(userId, updateUserDto);
        return {
            statusCode: HttpStatus.OK,
            message: "Customer updated successfully.",
            data: result,
        }
    }

    @UseGuards(JwtAuthGuard) // Get User by ID with authorized user
    @Get(":userId")
    async getUserById(@Param("userId") userId: string, @CurrentUser() user: User) {
        if (user.role === Role.ADMIN) {
            return this.userService.getUserByIdWithDetails(userId);
        } else {
            const result = await this.userService.getUserByIdWithoutCredential(userId);
            // if (user.role === result.role) throw new NotFoundException('User not found'); //same role cannot see each other
            return {
                statusCode: HttpStatus.OK,
                message: "User retrieved successfully.",
                data: result,
            }
        }
    }

    @Roles(Role.ADMIN) // Set User State by Admin
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Put("set-state/:userId") // PUT /users/status/:userId
    async setUserState(@Param("userId") userId: string, @Body() { state }: SetUserStatusDto) {
        await this.userService.setUserState(userId, state);
        return {
            statusCode: HttpStatus.OK,
            message: `User with ID ${userId} state has been updated to ${state}.`,
        }
    }

    @Roles(Role.ADMIN) // Delete User by Admin
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Delete(":userId")
    async deleteUser(@Param("userId") userId: string) {
        await this.userService.deleteUser(userId, true);
        return {
            statusCode: HttpStatus.OK,
            message: `User with ID ${userId} has been deleted successfully.`,
        }
    }

    @UseGuards(JwtAuthGuard) // Delete Current User
    @Delete("me")
    async deleteCurrentUser(@CurrentUser() { id: userId }: User) {
        await this.userService.deleteUser(userId, false);
        return {
            statusCode: HttpStatus.OK,
            message: `User with ID ${userId} has been deleted successfully.`,
        }
    }
}
