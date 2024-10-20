import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { AnimalTypeService } from './animal-type.service';
import { AnimalTypeDto } from './dto/create-animal-type.dto';

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

    @Post()
    async addAnimalType(@Body() { name }: AnimalTypeDto) {
        return this.animalTypeService.addAnimalType(name);
    }

    @Put(":id")
    async updateAnimalType(@Param("id") id: string, @Body() { name }: AnimalTypeDto) {
        return this.animalTypeService.updateAnimalType(id, name);
    }
}
