import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { BreedService } from './breed.service';
import { BreedDto } from './dto/breed.dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';

@Controller('breeds')
export class BreedController {
    constructor(private readonly breedService: BreedService) { }

    @UseGuards(JwtAuthGuard)
    @Get()
    async getBreeds() {
        const result = await this.breedService.getBreeds();
        return {
            message: "Breeds retrieved successfully.",
            data: result,
        }
    }

    @UseGuards(JwtAuthGuard)
    @Get(":breedId")
    async getBreedById(@Param("breedId") id: string) {
        const result = await this.breedService.getBreedById(id);
        return {
            message: "Breed retrieved successfully.",
            data: result
        }
    }

    @UseGuards(JwtAuthGuard)
    @Get("animalType/:animalTypeId")
    async getBreedsByAnimalTypeId(@Param("animalTypeId") animalTypeId: string) {
        const result = await this.breedService.getBreedsByAnimalTypeId(animalTypeId);
        return {
            message: "Breeds retrieved successfully.",
            data: result
        }
    }

    @UseGuards(JwtAuthGuard)
    @Post()
    async addBreed(@Body() { name, animalTypeId }: BreedDto) {
        const result = await this.breedService.addBreed(name, animalTypeId);
        return {
            message: "Breed created successfully.",
            data: result
        }
    }
}
