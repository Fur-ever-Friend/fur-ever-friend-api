import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Breed } from '@prisma/client';

@Injectable()
export class BreedService {
    constructor(private readonly prismaService: PrismaService) { }

    async getBreeds(): Promise<Breed[]> {
        return this.prismaService.breed.findMany({
            include: {
                animalType: true
            }
        });
    }

    async getBreedById(id: string): Promise<Breed> {
        const breed = await this.prismaService.breed.findUnique({
            where: {
                id: id
            },
            include: {
                animalType: true
            }
        });
        if (!breed) throw new NotFoundException("Breed not found");
        
        return breed;
    }

    async getBreedsByAnimalTypeId(animalTypeId: string): Promise<Breed[]> {
        return this.prismaService.breed.findMany({
            where: {
                animalTypeId: animalTypeId
            },
            include: {
                animalType: true
            }
        });
    }
}
