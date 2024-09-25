import { Body, Controller, Get, Param, Post, RawBody, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { PetService } from './pets.service';
import { CreatePetDto, TestWrapper } from './dto/create-pet.dto';
import { v4 as uuidV4 } from "uuid";
import { AnyFilesInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
@Controller('pets')
export class PetController {
    constructor(private readonly petService: PetService) { }

    // @Post()
    // create(@Body() createPetsDto: CreatePetDto) {
    //     return this.petService.createPets(createPetsDto);
    // }

    @Post()
    @UseInterceptors(
        FilesInterceptor('pets[*].imageUrl', 10, {
            storage: diskStorage({
                destination: './uploads',
                filename: (_, file, callback) => {
                    console.log("test file pipe", file.filename);
                    const [originalFilename, fileExt] = file.originalname.split('.');
                    const id = uuidV4();
                    const fileName = `${id}-${originalFilename}.${fileExt}`;
                    callback(null, fileName);
                },
            }),
            limits: { fileSize: 5 * 1024 * 1024 },
            fileFilter(_, file, callback) {
                const validExtensions = /\.(jpg|jpeg|png|gif)$/;
                console.log("file", file.originalname);
                if (!file.originalname.match(validExtensions)) {
                    return callback(null, false);
                }
                callback(null, true);
            },
        }),
    )
    async create(@Body() createPetsDto: any, @UploadedFiles() files: Express.Multer.File[]) {
        console.log("files", files);

        // createPetsDto.pets.forEach((pet, index) => {
        //     if (files[index]) {
        //         pet.imageUrl = files[index].filename;
        //     }
        // });

        // return this.petService.createPets(createPetsDto);
        console.log("owner id", createPetsDto.ownerId);
        return {}
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
        return this.petService.getPetsByOwner(ownerId);
    }

    @Post('test')
    @UseInterceptors(AnyFilesInterceptor({
        storage: diskStorage({
            destination: './uploads',
            filename: (req, file, callback) => {
                console.log('file:', file);
                const fileExt = file.originalname.split('.').pop();
                const originalFilename = file.originalname.substring(0, file.originalname.lastIndexOf('.'));
                const id = uuidV4();
                const fileName = `${id}-${originalFilename}.${fileExt}`;
                callback(null, fileName);
            },
        }),
        limits: { fileSize: 5 * 1024 * 1024 },
        fileFilter: (req, file, callback) => {
            console.log('file:', file);
            const validExtensions = /\.(jpg|jpeg|png|gif)$/;
            if (!file.originalname.match(validExtensions)) {
                return callback(null, false); // Reject file
            }
            callback(null, true); // Accept file
        },
    }))
    async test(@UploadedFiles() files: Array<Express.Multer.File>, @Body() body: TestWrapper) {
        console.log('Body:', body);
        console.log('Files:', files);
        return { message: "test" };
    }

}
