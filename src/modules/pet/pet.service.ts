import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Pet, Prisma } from '@prisma/client';
import { CreatePetDto } from './dto/create-pet.dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { BreedService } from '../breed/breed.service';
import { AnimalTypeService } from '../animal-type/animal-type.service';
import { CustomerService } from '../customer/customer.service';
import { UpdatePetDto } from './dto/update-pet.dto';

@Injectable()
export class PetService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly breedService: BreedService,
        private readonly animalTypeService: AnimalTypeService,
        private readonly customerService: CustomerService,
    ) { }

    async getPets(): Promise<Pet[]> {
        return this.prismaService.pet.findMany({
            include: {
                breed: true,
                animalType: true,
                owner: true,
            }
        });
    }

    async getPetById(id: string): Promise<Pet> {
        return this.prismaService.pet.findUnique({
            where: {
                id: id
            },
            include: {
                breed: true,
                animalType: true,
                owner: true,
            }
        });
    }

    async getPetsByOwnerId(ownerId: string): Promise<Pet[]> {
        return this.prismaService.pet.findMany({
            where: {
                ownerId: ownerId
            },
            include: {
                breed: true,
                animalType: true,
                owner: true,
            }
        });
    }

    async createPet(data: CreatePetDto, ownerId: string): Promise<Pet> {
        const { breedId, animalTypeId, ...rest } = data;

        const owner = await this.customerService.getCustomerById(ownerId);
        if (!owner) throw new NotFoundException("Owner not found");

        const breed = await this.breedService.getBreedById(breedId);
        if (!breed) throw new NotFoundException("Breed not found");

        const animalType = await this.animalTypeService.getAnimalTypeById(animalTypeId);
        if (!animalType) throw new NotFoundException("Animal type not found");

        try {
            const pet = await this.prismaService.pet.create({
                data: {
                    ...rest,
                    ownerId,
                    breedId,
                    animalTypeId,
                } as any,
                include: {
                    breed: true,
                    animalType: true,
                    owner: true,
                }
            });
            return pet;
        } catch (error) {
            if (error instanceof PrismaClientKnownRequestError) {
                console.log("prisma error", error.message);
                throw error;
            } else if (error instanceof Error) {
                console.log("generic error", error.message);
                throw new InternalServerErrorException();
            }
            console.log("error", error);
            throw new InternalServerErrorException();
        }
    }

    async updatePet(id: string, data: UpdatePetDto): Promise<Pet> {
        if (data.animalTypeId) {
            const animalType = await this.animalTypeService.getAnimalTypeById(data.animalTypeId);
            if (!animalType) throw new NotFoundException("Animal type not found");
        }
        if (data.breedId) {
            const breed = await this.breedService.getBreedById(data.breedId);
            if (!breed) throw new NotFoundException("Breed not found");
            if (data.animalTypeId && breed.animalTypeId !== data.animalTypeId) {
                throw new NotFoundException("Breed does not match animal type");
            }
        }

        try {
            const pet = await this.prismaService.pet.update({
                where: {
                    id
                },
                data: {
                    ...data
                },
                include: {
                    breed: true,
                    animalType: true,
                    owner: true,
                }
            });

            return pet;
        } catch (error) {
            if (error instanceof PrismaClientKnownRequestError) {
                if (error.code === "P2025") throw new NotFoundException("Pet not found");
            } else if (error instanceof Error) {
                console.log("generic error", error.message);
                throw new InternalServerErrorException();
            }
            console.log("error", error);
            throw new InternalServerErrorException();
        }
    }

    async deletePet(id: string, ownerId: string): Promise<Boolean> {
        try {
            if (!ownerId) throw new InternalServerErrorException("Owner Id is required");
            if (!id) throw new InternalServerErrorException("Pet Id is required");

            await this.prismaService.pet.delete({
                where: {
                    id,
                    ownerId
                }
            })
            return true;
        } catch (error) {
            if (error instanceof PrismaClientKnownRequestError) {
                if (error.code === "P2025") throw new NotFoundException("Pet not found");
            } else if (error instanceof Error) {
                console.log("generic error", error.message);
                throw new InternalServerErrorException();
            }
            console.log("error", error);
            throw new InternalServerErrorException();
        }
    }

    async deletePetsByOwnerId(ownerId: string): Promise<Boolean> {
        try {
            await this.prismaService.pet.deleteMany({
                where: {
                    ownerId
                }
            });
            return true;
        } catch (error) {
            if (error instanceof PrismaClientKnownRequestError) {
                console.log("prisma error", error.message);
                throw error;
            } else if (error instanceof Error) {
                console.log("generic error", error.message);
                throw new InternalServerErrorException();
            }
            console.log("error", error);
            throw new InternalServerErrorException();
        }
    }

    async deleteAllPets(): Promise<Boolean> {
        try {
            await this.prismaService.pet.deleteMany();
            return true;
        } catch (error) {
            if (error instanceof PrismaClientKnownRequestError) {
                console.log("prisma error", error.message);
                throw error;
            } else if (error instanceof Error) {
                console.log("generic error", error.message);
                throw new InternalServerErrorException();
            }
            console.log("error", error);
            throw new InternalServerErrorException();
        }
    }

}
