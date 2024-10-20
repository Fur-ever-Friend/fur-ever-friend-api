import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnimalTypeService {
    constructor(private readonly prismaService: PrismaService) { }

    async getAnimalTypes() {
        return this.prismaService.animalType.findMany();
    }

    async getAnimalTypeById(id: string) {
        return this.prismaService.animalType.findUnique({
            where: {
                id: id
            }
        });
    }

    async getAnimalTypeByName(name: string) {
        return this.prismaService.animalType.findFirst({
            where: {
                name: name.toUpperCase()
            }
        });
    }

    async addAnimalType(name: string) {
        return this.prismaService.animalType.create({
            data: {
                name
            }
        });
    }

    async updateAnimalType(id: string, name: string) {
        return this.prismaService.animalType.update({
            where: {
                id
            },
            data: {
                name
            }
        });
    }
}
