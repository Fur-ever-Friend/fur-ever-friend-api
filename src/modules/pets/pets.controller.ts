import { BadRequestException, Body, Controller, Delete, Get, HttpStatus, Param, Patch, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { PetService } from './pets.service';
import { v4 as uuidV4 } from "uuid";
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { CreatePetDto, CreatePetSchema } from './dto/create-pet.dto';
import { UpdatePetDto, UpdatePetSchema } from './dto/update-pet.dto';
import { checkFileNameEncoding, generateRandomFileName } from 'src/utils/checkFilenameEncoding';
@Controller('pets')
export class PetController {
    constructor(private readonly petService: PetService) { }

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
            limits: { fileSize: 5 * 1024 * 1024 },
            fileFilter(_, file, callback) {
                const validExtensions = /\.(jpg|jpeg|png|gif)$/;
                if (!file.originalname.match(validExtensions)) {
                    return callback(null, false);
                }
                callback(null, true);
            },
        }),
    )
    async create(
        @Body("json") json: string,
        @UploadedFile() file: Express.Multer.File
    ) {
        try {
            const jsonParse = JSON.parse(json);
            const validateData = CreatePetSchema.safeParse(jsonParse);
            if (!validateData.success) throw new BadRequestException("Invalid Field");
            const data = validateData.data satisfies CreatePetDto;
            data.imageUrl = file.filename;
            return this.petService.createPet(data);
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

    @Get("owner/:ownerId")
    getPetsByOwner(@Param("ownerId") ownerId: string) {
        return this.petService.getPetsByOwnerId(ownerId);
    }

    @Patch(":petId")
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
            limits: { fileSize: 5 * 1024 * 1024 },
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
        @Param("petId") id: string,
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

    @Delete(":petId")
    async deletePet(@Param("petId") id: string) {
        const deleted = await this.petService.deletePet(id);
        if (!deleted) throw new BadRequestException("Pet not found");
        return {
            statusCode: HttpStatus.OK,
            message: "Pet deleted"
        }
    }

    @Delete("owner/:ownerId")
    async deletePetsByOwner(@Param("ownerId") ownerId: string) {
        await this.petService.deletePetsByOwnerId(ownerId);
        return {
            statusCode: HttpStatus.OK,
            message: "All pets deleted"
        }
    }

    @Delete()
    async deleteAllPets() {
        await this.petService.deleteAllPets();
        return {
            statusCode: HttpStatus.OK,
            message: "All pets deleted"
        }
    }
}
