import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateFavouriteDto } from './dto/create-favourite.dto';
import { PrismaService } from '../prisma/prisma.service';
import { UserService } from '../user/user.service';
import { handleError } from '@/common/utils';
import { ActivityState } from '@prisma/client';

@Injectable()
export class FavouriteService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly userService: UserService,
  ) { }

  async create(createFavouriteDto: CreateFavouriteDto) {
    const existingCustomer = await this.userService.getUserByCustomerId(createFavouriteDto.customerId);
    const existingPetsitter = await this.userService.getUserByPetsitterId(createFavouriteDto.petsitterId);

    try {
      const favourite = await this.prismaService.favourite.create({
        data: {
          customer: {
            connect: { id: existingCustomer.id },
          },
          petsitter: {
            connect: { id: existingPetsitter.id },
          },
        },
        select: {
          id: true,
          customer: {
            select: {
              id: true,
              user: {
                select: {
                  id: true,
                  email: true,
                  firstname: true,
                  lastname: true,
                  avatar: true,
                  accountStatus: true,
                  role: true,
                  phone: true,
                },
              }
            }
          },
          petsitter: {
            select: {
              id: true,
              user: {
                select: {
                  id: true,
                  email: true,
                  firstname: true,
                  lastname: true,
                  avatar: true,
                  accountStatus: true,
                  role: true,
                  phone: true,
                },
              }
            }
          }
        }
      });

      return favourite;
    } catch (err: unknown) {
      handleError(err, "favourite.create", "favorite");
    }
  }

  findAll() {
    return this.prismaService.favourite.findMany({
      select: {
        id: true,
        customer: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
                email: true,
                firstname: true,
                lastname: true,
                avatar: true,
                accountStatus: true,
                role: true,
                phone: true,
              },
            }
          }
        },
        petsitter: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
                email: true,
                firstname: true,
                lastname: true,
                avatar: true,
                accountStatus: true,
                role: true,
                phone: true,
              },
            }
          }
        }
      }
    });
  }

  async findAllByCustomer(customerId: string) {
    await this.userService.getUserByCustomerId(customerId);
    const favorites = await this.prismaService.favourite.findMany({
      where: { customerId },
      select: {
        id: true,
        customer: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
                email: true,
                firstname: true,
                lastname: true,
                avatar: true,
                accountStatus: true,
                role: true,
                phone: true,
              },
            },
          }
        },
        petsitter: {
          select: {
            id: true,
            activities: {
              select: {
                id: true,
                title: true,
                detail: true,
                state: true,
                createdAt: true,
                customerId: true,
              },
            },
            user: {
              select: {
                id: true,
                email: true,
                firstname: true,
                lastname: true,
                avatar: true,
                accountStatus: true,
                role: true,
                phone: true,
              },
            },
            reviews: {
              select: {
                id: true,
                rating: true,
                content: true,
                customer: {
                  select: {
                    id: true,
                    user: {
                      select: {
                        id: true,
                        email: true,
                        firstname: true,
                        lastname: true,
                        avatar: true,
                        accountStatus: true,
                        role: true,
                        phone: true,
                      },
                    },
                  },
                },
                activity: {
                  select: {
                    id: true,
                    title: true,
                    detail: true,
                    price: true,
                    startDateTime: true,
                    endDateTime: true,
                    pickupPoint: true,
                    state: true,
                    createdAt: true,
                    updatedAt: true,
                    services: {
                      select: {
                        id: true,
                        pet: {
                          select: {
                            id: true,
                            name: true,
                            age: true,
                            gender: true,
                            weight: true,
                            allergy: true,
                            imageUrl: true,
                            otherDetail: true,
                            personality: true,
                            breed: {
                              select: {
                                id: true,
                                name: true,
                                animalType: {
                                  select: {
                                    id: true,
                                    name: true,
                                  },
                                },
                              },
                            },
                            animalType: {
                              select: {
                                id: true,
                                name: true,
                              },
                            },
                          },
                        },
                        tasks: {
                          select: {
                            id: true,
                            createdAt: true,
                            status: true,
                            type: true,
                            detail: true,
                            activityServiceId: true,
                          },
                        },
                      },
                    },
                    progresses: {
                      select: {
                        id: true,
                        images: true,
                        content: true,
                        createdAt: true,
                      },
                    },
                  },
                },
              },
            }
          }
        }
      }
    });

    const activityDone = favorites.map((favorites) => favorites.petsitter.activities.filter((activity) => activity.state === ActivityState.COMPLETED));
    return favorites;
  }

  async remove(id: string, customerId: string) {
    await this.userService.getUserByCustomerId(customerId);
    const favourite = await this.prismaService.favourite.findUnique({
      where: { id },
    });

    if (!favourite) {
      throw new NotFoundException('Favourite not found');
    }

    if (favourite.customerId !== customerId) {
      throw new UnauthorizedException('You are not authorized to delete this favourite');
    }

    return this.prismaService.favourite.delete({
      where: { id },
    });
  }
}
