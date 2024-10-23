import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Pet, Prisma } from '@prisma/client';
import { CreatePetDto } from './dto/create-pet.dto';
import { BreedService } from '../breed/breed.service';
import { AnimalTypeService } from '../animal-type/animal-type.service';
import { CustomerService } from '../customer/customer.service';
import { UpdatePetDto } from './dto/update-pet.dto';
import { handleError } from 'src/common/utils';

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
                breed: {
                    select: {
                        id: true,
                        name: true,
                    }
                },
                animalType: {
                    select: {
                        id: true,
                        name: true,
                    }
                },
                owner: {
                    select: {
                        id: true,
                        user: {
                            select: {
                                id: true,
                                email: true,
                                firstname: true,
                                lastname: true,
                                avatar: true,
                            }
                        }
                    }
                },
            }
        });
    }

    async getPetById(id: string): Promise<Partial<Pet>> {
        return this.prismaService.pet.findUnique({
            where: {
                id: id
            },
            select: {
                id: true,
                name: true,
                weight: true,
                age: true,
                imageUrl: true,
                allergy: true,
                personality: true,
                otherDetail: true,
                services: true,
                gender: true,
                breed: {
                    select: {
                        id: true,
                        name: true,
                    }
                },
                animalType: {
                    select: {
                        id: true,
                        name: true,
                    }
                },
                owner: {
                    select: {
                        id: true,
                        user: {
                            select: {
                                id: true,
                                email: true,
                                firstname: true,
                                lastname: true,
                                avatar: true,
                            }
                        }
                    }
                },
            }
        });
    }

    async getPetsByOwnerId(ownerId: string): Promise<Pet[]> {
        return this.prismaService.pet.findMany({
            where: {
                ownerId: ownerId
            },
            include: {
                breed: {
                    select: {
                        id: true,
                        name: true,
                    }
                },
                animalType: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            }
        });
    }

    async createPet(data: CreatePetDto, ownerId: string): Promise<Partial<Pet>> {
        try {
            const { breedId, animalTypeId, ...rest } = data;

            const owner = await this.customerService.getCustomerById(ownerId);
            if (!owner) throw new NotFoundException("Owner not found");

            const breed = await this.breedService.getBreedById(breedId);
            if (!breed) throw new NotFoundException("Breed not found");

            const animalType = await this.animalTypeService.getAnimalTypeById(animalTypeId);
            if (!animalType) throw new NotFoundException("Animal type not found");

            const pet = await this.prismaService.pet.create({
                data: {
                    ...rest as Prisma.PetCreateInput,
                    ownerId,
                    breedId,
                    animalTypeId,
                } as Prisma.PetCreateInput,
                select: {
                    id: true,
                    name: true,
                    weight: true,
                    age: true,
                    gender: true,
                    allergy: true,
                    personality: true,
                    imageUrl: true,
                    otherDetail: true,
                    services: true,
                    owner: {
                        select: {
                            id: true,
                            user: {
                                select: {
                                    id: true,
                                    email: true,
                                    firstname: true,
                                    lastname: true,
                                    avatar: true,
                                }
                            }
                        }
                    },
                    animalType: {
                        select: {
                            id: true,
                            name: true,
                        }
                    },
                    breed: {
                        select: {
                            id: true,
                            name: true,
                        }
                    }
                }
            });
            return pet;
        } catch (err: unknown) {
            handleError(err, 'petService.createPet');
        }
    }

    async updatePet(id: string, data: UpdatePetDto): Promise<Partial<Pet>> {
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
                select: {
                    id: true,
                    name: true,
                    breed: {
                        select: {
                            id: true,
                            name: true,
                        }
                    },
                    animalType: {
                        select: {
                            id: true,
                            name: true,
                        }
                    },
                    imageUrl: true,
                    age: true,
                    allergy: true,
                    gender: true,
                    weight: true,
                    personality: true,
                    otherDetail: true,
                    services: true,
                    owner: {
                        select: {
                            id: true,
                            user: {
                                select: {
                                    id: true,
                                    email: true,
                                    firstname: true,
                                    lastname: true,
                                    avatar: true,
                                }
                            },
                        }
                    },
                }
            });

            return pet;
        } catch (err: unknown) {
            handleError(err, 'petService.updatePet');
        }
    }

    async deletePet(id: string, ownerId: string): Promise<void> {
        try {
            if (!ownerId) throw new InternalServerErrorException("Owner Id is required");
            if (!id) throw new InternalServerErrorException("Pet Id is required");

            await this.prismaService.pet.delete({
                where: {
                    id,
                    ownerId
                }
            })
        } catch (err: unknown) {
            handleError(err, 'petService.deletePet');
        }
    }

    async deletePetsByOwnerId(ownerId: string): Promise<void> {
        try {
            await this.prismaService.pet.deleteMany({
                where: {
                    ownerId
                }
            });
        } catch (err: unknown) {
            handleError(err, 'petService.deletePetsByOwnerId');
        }
    }

    async deleteAllPets(): Promise<void> {
        try {
            await this.prismaService.pet.deleteMany();
        } catch (err: unknown) {
            handleError(err, 'petService.deleteAllPets');
        }
    }

}
