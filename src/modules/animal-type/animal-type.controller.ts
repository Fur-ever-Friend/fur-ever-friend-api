import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { AnimalTypeService } from './animal-type.service';
import { AnimalTypeDto } from './dto/create-animal-type.dto';

@Controller('animal-types')
export class AnimalTypeController {
    constructor(private readonly animalTypeService: AnimalTypeService) { }

    @Get()
    async getAnimalTypes() {
        const result = await this.animalTypeService.getAnimalTypes();
        return {
            message: "Animal types retrieved successfully.",
            data: result
        }
    }

    @Get(":animalTypeId")
    async getAnimalTypeById(@Param("animalTypeId") id: string) {
        const result = await this.animalTypeService.getAnimalTypeById(id);
        return {
            message: "Animal type retrieved successfully.",
            data: result
        }
    }

    @Post()
    async addAnimalType(@Body() { name }: AnimalTypeDto) {
        const result = await this.animalTypeService.addAnimalType(name);
        return {
            message: "Animal type created successfully.",
            data: result
        }
    }

    @Put(":id")
    async updateAnimalType(@Param("id") id: string, @Body() { name }: AnimalTypeDto) {
        const result = await this.animalTypeService.updateAnimalType(id, name);
        return {
            message: "Animal type updated successfully.",
            data: result
        }
    }
}
