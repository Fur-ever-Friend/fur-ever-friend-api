import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnimalTypeService {
    constructor(private readonly prismaService: PrismaService) { }

    async getAnimalTypes() {
        return this.prismaService.animalType.findMany();
    }

    async getAnimalTypeById(id: string) {
        const animalType = await this.prismaService.animalType.findUnique({
            where: {
                id: id
            }
        });
        if (!animalType) {
            throw new NotFoundException("Animal type not found");
        }
        return animalType;
    }

    async getAnimalTypeByName(name: string) {
        const animalType = await this.prismaService.animalType.findUnique({
            where: {
                name,
            },
        });
        if (!animalType) {
            throw new NotFoundException("Animal type not found");
        }
        return animalType;
    }

    async addAnimalType(name: string) {
        return this.prismaService.animalType.create({
            data: {
                name,
            },
        });
    }

    async updateAnimalType(id: string, name: string) {
        return this.prismaService.animalType.update({
            where: {
                id,
            },
            data: {
                name,
            }
        });
    }
}
