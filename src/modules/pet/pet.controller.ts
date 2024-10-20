import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
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
import { checkFileNameEncoding, generateRandomFileName } from 'src/common/utils/checkFilenameEncoding';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role, User } from '@prisma/client';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';

@Controller('pets')
export class PetController {
    constructor(private readonly petService: PetService) { }

    @Roles(Role.CUSTOMER)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Post()
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: './uploads',
                filename: (_, file, callback) => {
                    const [originalFilename, fileExt] = file.originalname.split('.');
                    const extension = file.mimetype.split("/")[1];
                    const id = uuidV4();
                    let filename: string;
                    if (!checkFileNameEncoding(originalFilename)) filename = `${id}-${generateRandomFileName()}.${extension}`;
                    else filename = `${id}-${originalFilename}.${fileExt}`;
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
        try {
            console.log("id", user["customer"]["id"]);
            const jsonParse = JSON.parse(json);
            const validateData = CreatePetSchema.safeParse(jsonParse);
            if (!validateData.success) throw new BadRequestException("Invalid Field");
            const data = validateData.data satisfies CreatePetDto;
            data.imageUrl = file.filename;
            return this.petService.createPet(data, user["customer"]["id"]);
        } catch (error) {
            throw new BadRequestException("Invalid JSON");
        }
    }

    @Get()
    getAllPet() {
        return this.petService.getPets();
    }

    @Get(":petId")
    getPetById(@Param("petId") id: string) {
        return this.petService.getPetById(id);
    }

    @Roles(Role.CUSTOMER)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Get("owner")
    getPetsByOwner(@CurrentUser() user: User) {
        return this.petService.getPetsByOwnerId(user["customer"]["id"]);
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
                    if (!checkFileNameEncoding(originalFilename)) filename = `${id}-${generateRandomFileName()}.${extension}`;
                    else filename = `${id}-${originalFilename}.${fileExt}`;
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
    updatePet(
        @Param("id") id: string,
        @Body("json") json: string,
        @UploadedFile() file: Express.Multer.File
    ) {
        try {
            const parseJson = JSON.parse(json);
            const validateData = UpdatePetSchema.safeParse(parseJson);
            if (!validateData.success) throw new BadRequestException("Invalid Field");
            const data = validateData.data satisfies UpdatePetDto;
            if (file) data.imageUrl = file.filename;
            return this.petService.updatePet(id, data);
        } catch (error) {
            if (error instanceof BadRequestException) throw error;
            throw new BadRequestException("Invalid JSON");
        }
    }

    @Roles(Role.CUSTOMER)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Delete(":id")
    async deletePet(@Param("id") id: string, @CurrentUser() user: User) {
        const deleted = await this.petService.deletePet(id, user["customer"]["id"]);
        if (!deleted) throw new BadRequestException("Pet not found");
        return {
            statusCode: HttpStatus.OK,
            message: "Pet deleted"
        }
    }

    @Roles(Role.CUSTOMER)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Delete("owner/:ownerId")
    async deletePetsByOwner(@Param("ownerId") ownerId: string) {
        await this.petService.deletePetsByOwnerId(ownerId);
        return {
            statusCode: HttpStatus.OK,
            message: "All pets deleted"
        }
    }

    @Roles(Role.ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Delete()
    async deleteAllPets() {
        await this.petService.deleteAllPets();
        return {
            statusCode: HttpStatus.OK,
            message: "All pets deleted"
        }
    }
}
