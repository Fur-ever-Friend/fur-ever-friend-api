import { Controller, Get, Param } from '@nestjs/common';
import { BreedService } from './breeds.service';

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
}
