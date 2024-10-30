import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Put, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';

import { AnimalTypeService } from './animal-type.service';
import { AnimalTypeDto } from './dto/create-animal-type.dto';
import { Id } from '@/common/global-dtos/id-query.dto';
import { Roles } from '@/common/decorators/roles.decorator';
import { RolesGuard } from '@/common/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';

@Controller('animal-types')
export class AnimalTypeController {
    constructor(private readonly animalTypeService: AnimalTypeService) { }

    @Roles(Role.ADMIN, Role.CUSTOMER, Role.PETSITTER)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Get()
    async getAnimalTypes() {
        const result = await this.animalTypeService.getAnimalTypes();
        return {
            statusCode: HttpStatus.OK,
            message: "Animal types retrieved successfully.",
            data: result
        }
    }

    @Roles(Role.ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Get(":id")
    async getAnimalTypeById(@Param() { id }: Id) {
        const result = await this.animalTypeService.getAnimalTypeById(id);
        return {
            statusCode: HttpStatus.OK,
            message: "Animal type retrieved successfully.",
            data: result
        }
    }

    @Roles(Role.ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @HttpCode(HttpStatus.CREATED)
    @Post()
    async addAnimalType(@Body() { name }: AnimalTypeDto) {
        const result = await this.animalTypeService.addAnimalType(name);
        return {
            statusCode: HttpStatus.CREATED,
            message: "Animal type created successfully.",
            data: result
        }
    }

    @Roles(Role.ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Put(":id")
    async updateAnimalType(@Param() { id }: Id, @Body() { name }: AnimalTypeDto) {
        const result = await this.animalTypeService.updateAnimalType(id, name);
        return {
            statusCode: HttpStatus.OK,
            message: "Animal type updated successfully.",
            data: result
        }
    }
}
