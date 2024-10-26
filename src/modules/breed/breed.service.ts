import { Injectable, NotFoundException } from '@nestjs/common';
import { Breed } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { handleError } from 'src/common/utils';
import { AnimalTypeService } from '../animal-type/animal-type.service';

@Injectable()
export class BreedService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly animalTypeService: AnimalTypeService,
    ) { }

    async getBreeds(): Promise<Partial<Breed>[]> {
        return this.prismaService.breed.findMany({
            select: {
                id: true,
                name: true,
                animalType: {
                    select: {
                        id: true,
                        name: true
                    }
                },
            }
        });
    }

    async getBreedById(id: string): Promise<Partial<Breed>> {
        const breed = await this.prismaService.breed.findUnique({
            where: {
                id: id,
            },
            select: {
                id: true,
                name: true,
                animalType: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            }
        });
        if (!breed) {
            throw new NotFoundException("Breed not found");
        }
        return breed;
    }

    async getBreedsByAnimalTypeId(animalTypeId: string): Promise<Partial<Breed>[]> {
        try {
            const breeds = await this.prismaService.breed.findMany({
                where: {
                    animalTypeId: animalTypeId
                },
                select: {
                    id: true,
                    name: true,
                    animalType: {
                        select: {
                            id: true,
                            name: true,
                        }
                    },
                }
            });
            return breeds;
        } catch (err: unknown) {
            handleError(err, "BreedService.getBreedsByAnimalTypeId", "breeds");
        }
    }

    async addBreed(name: string, animalTypeId: string): Promise<Partial<Breed>> {
        try {
            const animalType = await this.animalTypeService.getAnimalTypeById(animalTypeId);

            const breed = await this.prismaService.breed.create({
                data: {
                    name,
                    animalTypeId
                },
                select: {
                    id: true,
                    name: true,
                },
            });
            breed["animalType"] = {
                id: animalType.id,
                name: animalType.name,
            };
            return breed;
        } catch (err: unknown) {
            handleError(err, "BreedService.addBreed", "breed");
        }
    }
}
