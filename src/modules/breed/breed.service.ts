import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Breed } from '@prisma/client';
import { handleError } from 'src/common/utils';

@Injectable()
export class BreedService {
    constructor(private readonly prismaService: PrismaService) { }

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
        try {
            const breed = await this.prismaService.breed.findUniqueOrThrow({
                where: {
                    id: id
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
            return breed;
        } catch (err: unknown) {
            handleError(err, "BreedService.getBreedById");
        }
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
            handleError(err, "BreedService.getBreedsByAnimalTypeId");
        }
    }

    async addBreed(name: string, animalTypeId: string): Promise<Partial<Breed>> {
        try {
            const breed = await this.prismaService.breed.create({
                data: {
                    name,
                    animalTypeId
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
                },
            });
            return breed;
        } catch (err: unknown) {
            handleError(err, "BreedService.addBreed");
        }
    }
}
