import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';

import { BreedService } from './breed.service';
import { BreedDto } from './dto/breed.dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { RolesGuard } from '@/common/guards/roles.guard';

@Controller('breeds')
export class BreedController {
    constructor(private readonly breedService: BreedService) { }

    @Roles(Role.ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Get()
    async getBreeds() {
        const result = await this.breedService.getBreeds();
        return {
            statusCode: HttpStatus.OK,
            message: "Breeds retrieved successfully.",
            data: result,
        }
    }

    @Roles(Role.ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Get(":breedId")
    async getBreedById(@Param("breedId") id: string) {
        const result = await this.breedService.getBreedById(id);
        return {
            statusCode: HttpStatus.OK,
            message: "Breed retrieved successfully.",
            data: result
        }
    }

    @Roles(Role.ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Get("animalType/:animalTypeId")
    async getBreedsByAnimalTypeId(@Param("animalTypeId") animalTypeId: string) {
        const result = await this.breedService.getBreedsByAnimalTypeId(animalTypeId);
        return {
            statusCode: HttpStatus.OK,
            message: "Breeds retrieved successfully.",
            data: result
        }
    }

    @Roles(Role.ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Post()
    @HttpCode(HttpStatus.CREATED)
    async addBreed(@Body() { name, animalTypeId }: BreedDto) {
        const result = await this.breedService.addBreed(name, animalTypeId);
        return {
            statusCode: HttpStatus.CREATED,
            message: "Breed created successfully.",
            data: result
        }
    }
}
