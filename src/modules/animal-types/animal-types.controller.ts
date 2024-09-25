import { Controller, Get, Param } from '@nestjs/common';
import { AnimalTypeService } from './animal-types.service';

@Controller('animal-types')
export class AnimalTypeController {
    constructor(private readonly animalTypeService: AnimalTypeService) { }

    @Get()
    async getAnimalTypes() {
        return this.animalTypeService.getAnimalTypes();
    }

    @Get(":animalTypeId")
    async getAnimalTypeById(@Param("animalTypeId") id: string) {
        return this.animalTypeService.getAnimalTypeById(id);
    }
}
