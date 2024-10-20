import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { BreedService } from './breed.service';
import { BreedDto } from './dto/breed.dto';

@Controller('breeds')
export class BreedController {
    constructor(private readonly breedService: BreedService) { }

    @Get()
    async getBreeds() {
        return this.breedService.getBreeds();
    }

    @Get(":breedId")
    async getBreedById(@Param("breedId") id: string) {
        return this.breedService.getBreedById(id);
    }

    @Get("animalType/:animalTypeId")
    async getBreedsByAnimalTypeId(@Param("animalTypeId") animalTypeId: string) {
        return this.breedService.getBreedsByAnimalTypeId(animalTypeId);
    }

    @Post()
    async addBreed(@Body() { name, animalTypeId }: BreedDto) {
        return this.breedService.addBreed(name, animalTypeId);
    }
}
