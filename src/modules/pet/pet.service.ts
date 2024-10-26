import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
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

    async getPets(): Promise<Partial<Pet>[]> {
        return this.prismaService.pet.findMany({
            select: {
                id: true,
                name: true,
                gender: true,
                weight: true,
                age: true,
                imageUrl: true,
                allergy: true,
                personality: true,
                breed: {
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
                gender: true,
                breed: {
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

    async getPetsByOwnerId(ownerId: string): Promise<Partial<Pet>[]> {
        return this.prismaService.pet.findMany({
            where: {
                ownerId: ownerId
            },
            select: {
                id: true,
                name: true,
                gender: true,
                weight: true,
                age: true,
                imageUrl: true,
                allergy: true,
                personality: true,
                otherDetail: true,
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
                        animalType: {
                            select: {
                                id: true,
                                name: true,
                            }
                        },
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
                        },
                    }
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
                            animalType: {
                                select: {
                                    id: true,
                                    name: true,
                                }
                            },
                        }
                    }
                }
            });
            return pet;
        } catch (err: unknown) {
            handleError(err, 'petService.createPet', 'pet');
        }
    }

    async updatePet(id: string, data: UpdatePetDto): Promise<Partial<Pet>> {
        const animalTypePromise = data.animalTypeId
            ? this.animalTypeService.getAnimalTypeById(data.animalTypeId)
            : null;

        const breedPromise = data.breedId
            ? this.breedService.getBreedById(data.breedId)
            : null;

        const [animalType, breed] = await Promise.all([animalTypePromise, breedPromise]);

        if (data.animalTypeId && !animalType) {
            throw new NotFoundException("Animal type not found");
        }

        if (data.breedId) {
            if (!breed) {
                throw new NotFoundException("Breed not found");
            }
            if (data.animalTypeId && breed.animalTypeId !== data.animalTypeId) {
                throw new NotFoundException("Breed does not match animal type");
            }
        }

        try {
            const pet = await this.prismaService.pet.update({
                where: { id },
                data: { ...data },
                select: {
                    id: true,
                    name: true,
                    breed: {
                        select: {
                            id: true, name: true, animalType: {
                                select: {
                                    id: true,
                                    name: true,
                                },
                            },
                        }
                    },
                    animalType: { select: { id: true, name: true } },
                    imageUrl: true,
                    age: true,
                    allergy: true,
                    gender: true,
                    weight: true,
                    personality: true,
                    otherDetail: true,
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
                                },
                            },
                        },
                    },
                },
            });

            return pet;
        } catch (err: unknown) {
            handleError(err, 'petService.updatePet', 'pet');
        }
    }


    async deletePet(id: string, ownerId: string): Promise<void> {
        try {
            await this.prismaService.pet.delete({
                where: {
                    id,
                    ownerId
                }
            })
        } catch (err: unknown) {
            handleError(err, 'petService.deletePet', 'pet');
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
            handleError(err, 'petService.deletePetsByOwnerId', 'pets');
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
