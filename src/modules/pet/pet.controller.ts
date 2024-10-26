import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Patch,
    Post,
    UploadedFile,
    UseGuards,
    UseInterceptors
} from '@nestjs/common';
import { PetService } from './pet.service';
import { v4 as uuidV4 } from "uuid";
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { CreatePetDto, CreatePetSchema } from './dto/create-pet.dto';
import { UpdatePetDto, UpdatePetSchema } from './dto/update-pet.dto';
import { checkFileNameEncoding, generateRandomFileName } from '@/common/utils/check-filename-encoding';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Pet, Role, User } from '@prisma/client';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { handleError } from 'src/common/utils';
import { Id } from '@/common/global-dtos/id-query.dto';

@Controller('pets')
export class PetController {
    constructor(private readonly petService: PetService) { }

    @Roles(Role.CUSTOMER)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Post()
    @HttpCode(HttpStatus.CREATED)
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: './uploads',
                filename: (_, file, callback) => {
                    const [originalFilename, fileExt] = file.originalname.split('.');
                    const extension = file.mimetype.split("/")[1];
                    const id = uuidV4();
                    let filename: string;
                    if (!checkFileNameEncoding(originalFilename)) filename = `${generateRandomFileName()}-${id}.${extension}`;
                    else filename = `${originalFilename}-${id}.${fileExt}`;
                    callback(null, filename);
                },
            }),
            limits: { fileSize: 10 * 1024 * 1024 },
            fileFilter(_, file, callback) {
                const validExtensions = /\.(jpg|jpeg|png)$/;
                if (!file.originalname.match(validExtensions)) {
                    return callback(null, false);
                }
                callback(null, true);
            },
        }),
    )
    async create(
        @CurrentUser() user: User,
        @Body("json") json: string,
        @UploadedFile() file: Express.Multer.File
    ) {
        const jsonParse = JSON.parse(json);
        const createPetDto = CreatePetSchema.parse(jsonParse);
        const data = createPetDto satisfies CreatePetDto;
        if (!file) {
            throw new BadRequestException("Image is required.");
        }
        data.imageUrl = file.filename;

        const result = await this.petService.createPet(data, user["customer"]["id"]);
        return {
            statusCode: HttpStatus.CREATED,
            message: "Pet created successfully.",
            data: result,
        }
    }

    @Roles(Role.ADMIN, Role.CUSTOMER)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Get()
    async getAllPet(@CurrentUser() user: User) {
        let result: Partial<Pet>[];
        if (user.role === Role.ADMIN) {
            result = await this.petService.getPets();
        } else if (user.role === Role.CUSTOMER) {
            result = await this.petService.getPetsByOwnerId(user["customer"]["id"]);
        }
        return {
            statusCode: HttpStatus.OK,
            message: "Pets retrieved successfully.",
            data: result,
        }
    }

    @Roles(Role.CUSTOMER)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Get("owner")
    async getPetsByOwner(@CurrentUser() user: User) {
        console.log(`owner id: ${user["customer"]["id"]}`);
        const result = await this.petService.getPetsByOwnerId(user["customer"]["id"]);
        return {
            statusCode: HttpStatus.OK,
            message: "Pets retrieved successfully.",
            data: result,
        }
    }

    @UseGuards(JwtAuthGuard)
    @Get(":id")
    async getPetById(@Param() { id }: Id) {
        const result = await this.petService.getPetById(id);
        return {
            statusCode: HttpStatus.OK,
            message: "Pet retrieved successfully.",
            data: result,
        }
    }

    @Roles(Role.CUSTOMER)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Patch(":id")
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: './uploads',
                filename: (_, file, callback) => {
                    const [originalFilename, fileExt] = file.originalname.split('.');
                    const extension = file.mimetype.split("/")[1];
                    const id = uuidV4();
                    let filename: string;
                    if (!checkFileNameEncoding(originalFilename)) filename = `${generateRandomFileName()}-${id}.${extension}`;
                    else filename = `${originalFilename}-${id}.${fileExt}`;
                    callback(null, filename);
                },
            }),
            limits: { fileSize: 10 * 1024 * 1024 },
            fileFilter(_, file, callback) {
                const validExtensions = /\.(jpg|jpeg|png|gif)$/;
                if (!file.originalname.match(validExtensions)) {
                    return callback(null, false);
                }
                callback(null, true);
            },
        }),
    )
    async updatePet(
        @Param() { id }: Id,
        @Body("json") json: string,
        @UploadedFile() file: Express.Multer.File
    ) {
        try {
            const parseJson = JSON.parse(json);
            const updatePetDto = UpdatePetSchema.parse(parseJson);
            if (file) updatePetDto.imageUrl = file.filename;
            const result = await this.petService.updatePet(id, updatePetDto);
            return {
                statusCode: HttpStatus.OK,
                message: "Pet updated successfully.",
                data: result,
            }
        } catch (err: unknown) {
            handleError(err, "updatePet", "pet");
        }
    }

    @Roles(Role.CUSTOMER, Role.ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Delete(":id")
    async deletePet(@Param() { id }: Id, @CurrentUser() user: User) {
        await this.petService.deletePet(id, user["customer"]["id"]);
        return {
            statusCode: HttpStatus.OK,
            message: "Pet deleted successfully.",
        }
    }

    @Roles(Role.ADMIN, Role.CUSTOMER)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Delete()
    async deleteAllPets(@CurrentUser() user: User) {
        if (user.role == Role.ADMIN) {
            await this.petService.deleteAllPets();
        } else if (user.role == Role.CUSTOMER) {
            await this.petService.deletePetsByOwnerId(user["customer"]["id"]);
        } else {
            throw new BadRequestException("You are not allowed to delete pets.");
        }
        return {
            statusCode: HttpStatus.OK,
            message: `All pets deleted successfully by ${user.role.toLocaleLowerCase()}.`,
        }
    }
}
