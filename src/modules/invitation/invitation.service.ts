import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { UpdateInvitationDto } from './dto/update-invitation.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InvitationService {
  constructor(private readonly prismaService: PrismaService) { }
  async create(createInvitationDto: CreateInvitationDto) {
    const { activityId, petsitterId } = createInvitationDto;
    const invitation = await this.prismaService.invitation.create({
      data: {
        activity: {
          connect: { id: activityId },
        },
        petsitter: {
          connect: { id: petsitterId },
        },
        link: `http://localhost:3000/activities/${activityId}`,
      }
    });
    return invitation;
  }

  async findAll() {
    const invitations = await this.prismaService.invitation.findMany({
      select: {
        id: true,
        activity: {
          select: {
            id: true,
            title: true,
            createdAt: true,
            detail: true,
            price: true,
            pickupPoint: true,
            services: {
              select: {
                id: true,
                pet: {
                  select: {
                    id: true,
                    name: true,
                    breed: {
                      select: {
                        id: true,
                        name: true,
                        animalType: {
                          select: {
                            id: true,
                            name: true,
                          }
                        }
                      },
                    },
                    age: true,
                    allergy: true,
                    gender: true,
                    weight: true,
                    imageUrl: true,
                    personality: true,
                  }
                },
              }
            },
            startDateTime: true,
            endDateTime: true,
            state: true,
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
              }
            }
          }
        },
        createdAt: true,
        link: true,
      }
    });
    return invitations
  }

  async findAllByPetsitter(petsitterId: string) {
    const invitations = await this.prismaService.invitation.findMany({
      where: { petsitterId },
      select: {
        id: true,
        activity: {
          select: {
            id: true,
            title: true,
            createdAt: true,
            detail: true,
            price: true,
            pickupPoint: true,
            services: {
              select: {
                id: true,
                pet: {
                  select: {
                    id: true,
                    name: true,
                    breed: {
                      select: {
                        id: true,
                        name: true,
                        animalType: {
                          select: {
                            id: true,
                            name: true,
                          }
                        }
                      },
                    },
                    age: true,
                    allergy: true,
                    gender: true,
                    weight: true,
                    imageUrl: true,
                    personality: true,
                  }
                },
              }
            },
            startDateTime: true,
            endDateTime: true,
            state: true,
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
              }
            }
          }
        },
        createdAt: true,
        link: true,
      }
    });

    return invitations;
  }

  async findOne(id: string) {
    const invitation = await this.prismaService.invitation.findUnique({
      where: { id },
      select: {
        id: true,
        activity: {
          select: {
            id: true,
            title: true,
            createdAt: true,
            detail: true,
            price: true,
            pickupPoint: true,
            services: {
              select: {
                id: true,
                pet: {
                  select: {
                    id: true,
                    name: true,
                    breed: {
                      select: {
                        id: true,
                        name: true,
                        animalType: {
                          select: {
                            id: true,
                            name: true,
                          }
                        }
                      },
                    },
                    age: true,
                    allergy: true,
                    gender: true,
                    weight: true,
                    imageUrl: true,
                    personality: true,
                  }
                },
              }
            },
            startDateTime: true,
            endDateTime: true,
            state: true,
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
              }
            }
          }
        },
        createdAt: true,
        link: true,
      }
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }
    
    return invitation;
  }
}
