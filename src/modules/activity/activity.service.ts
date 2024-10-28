import { Activity, ActivityProgress, ActivityState, Prisma, Role, User } from '@prisma/client';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

import {
  CreateActivityDto,
  CreateProgressDto,
  ActivityPetsitterQueryDto,
  ActivityQueryDto,
} from './dto';
import { PrismaService } from '../prisma/prisma.service';
import { AnimalTypeService } from '../animal-type/animal-type.service';
import { GLOBAL_CONSTS, validateAndConvertDateTimes, } from '@/common/utils';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class ActivityService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly animalTypeService: AnimalTypeService,
    private readonly notificationService: NotificationService,
  ) { }

  @Cron('*/16 * * * * *', {
    name: 'updateActivityStateFromAssignedToInProgress',
    timeZone: 'Asia/Bangkok',
  })
  async handleCronUpdateActivityStateFromAssignedToInProgress() {
    try {
      const now = new Date();
      const updatedRecords = await this.prismaService.activity.updateMany({
        where: {
          AND: [
            { startDateTime: { lte: now } },
            { state: ActivityState.ASSIGNED },
            { petsitterId: { not: null } },
          ],
        },
        data: {
          state: ActivityState.IN_PROGRESS,
        },
      });

      if (updatedRecords.count > 0) {
        const updatedActivities = await this.prismaService.activity.findMany({
          where: {
            startDateTime: { lte: now },
            state: ActivityState.IN_PROGRESS,
            petsitterId: { not: null },
          },
          orderBy: { updatedAt: 'desc' },
          take: updatedRecords.count,
          select: {
            id: true,
            title: true,
            detail: true,
            createdAt: true,
            updatedAt: true,
            startDateTime: true,
            endDateTime: true,
            price: true,
            pickupPoint: true,
            state: true,
            services: {
              select: {
                id: true,
                pet: {
                  select: {
                    id: true,
                    name: true,
                    breed: true,
                    age: true,
                  },
                },
                tasks: {
                  select: {
                    id: true,
                    type: true,
                    detail: true,
                    status: true,
                    createdAt: true,
                  },
                },
              },
            },
            customer: {
              select: {
                id: true,
                user: {
                  select: {
                    id: true,
                    email: true,
                    firstname: true,
                    lastname: true,
                  },
                },
              },
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
                  },
                },
              },
            },
            progresses: {
              select: {
                id: true,
                content: true,
                images: true,
                createdAt: true,
              },
            },
          }
        });

        for (const activity of updatedActivities) {
          await this.notificationService.create({
            title: 'Activity Started',
            content: `Your activity ${activity.title} has started.`,
            userId: activity.customer.user.id,
          });

          await this.notificationService.create({
            title: 'Activity Started',
            content: `You have started the activity ${activity.title}.`,
            userId: activity.petsitter.user.id,
          });
        }

      }

    } catch (err: unknown) {
      console.error('Error in cron job:', err);
    }
  }

  // @Cron('*/16 * * * * *', { // Runs every 16 seconds; adjust frequency as needed
  //   name: 'updateActivityStateFromReturningToCompleted',
  //   timeZone: 'Asia/Bangkok',
  // })
  // async handleCronUpdateActivityStateFromReturningToCompleted() {
  //   try {
  //     // const oneDayAgo = new Date();
  //     // oneDayAgo.setDate(oneDayAgo.getDate() - 1); // 24 hours ago

  //     const twoMinsAgo = new Date();
  //     twoMinsAgo.setMinutes(twoMinsAgo.getMinutes() - 2); // 2 minutes ago

  //     // Step 1: Find activities in the RETURNING state for more than 24 hours
  //     const overdueReturningActivities = await this.prismaService.activity.findMany({
  //       where: {
  //         state: ActivityState.RETURNING,
  //         updatedAt: { lte: twoMinsAgo },
  //       },
  //       select: {
  //         id: true,
  //         title: true,
  //         customer: {
  //           select: {
  //             id: true,
  //             user: {
  //               select: {
  //                 id: true,
  //               }
  //             }
  //           },
  //         },
  //         petsitter: {
  //           select: {
  //             id: true,
  //             user: {
  //               select: {
  //                 id: true,
  //               }
  //             }
  //           },
  //         },
  //       }
  //     });

  //     for (const activity of overdueReturningActivities) {
  //       // Step 2: Update the state to COMPLETED automatically
  //       await this.prismaService.activity.update({
  //         where: { id: activity.id },
  //         data: { state: ActivityState.COMPLETED },
  //       });

  //       // Step 3: Notify the customer and the pet sitter of the automatic completion
  //       console.log(`Activity ${activity.id} has been automatically marked as COMPLETED.`);

  //       await this.notificationService.create({
  //         title: 'Activity Completed',
  //         content: `Your activity ${activity.title} has been automatically marked as COMPLETED.`,
  //         userId: activity.customer.user.id,
  //       });

  //       await this.notificationService.create({
  //         title: 'Activity Completed',
  //         content: `The activity ${activity.title} has been automatically marked as COMPLETED.`,
  //         userId: activity.petsitter.user.id,
  //       });
  //     }
  //   } catch (err) {
  //     console.error('Error in auto-completing returning activities:', err);
  //   }
  // }

  // @Cron('*/16 * * * * *', {
  //   name: 'updateActivityStateFromInProgressToReturning',
  //   timeZone: 'Asia/Bangkok',
  // })
  // async handleCronUpdateActivityStateFromInProgressToReturning() {
  //   try {
  //     const now = new Date();
  //     const updatedRecords = await this.prismaService.activity.updateMany({
  //       where: {
  //         AND: [
  //           { endDateTime: { lte: now } },
  //           { state: ActivityState.IN_PROGRESS },
  //         ],
  //       },
  //       data: {
  //         state: ActivityState.RETURNING,
  //       },
  //     });

  //     if (updatedRecords.count > 0) {
  //       const updatedActivities = await this.prismaService.activity.findMany({
  //         where: {
  //           endDateTime: { lte: now },
  //           state: ActivityState.RETURNING,
  //         },
  //         orderBy: { updatedAt: 'desc' },
  //         take: updatedRecords.count,
  //         select: {
  //           id: true,
  //           title: true,
  //           detail: true,
  //           createdAt: true,
  //           updatedAt: true,
  //           startDateTime: true,
  //           endDateTime: true,
  //           price: true,
  //           pickupPoint: true,
  //           state: true,
  //           services: {
  //             select: {
  //               id: true,
  //               pet: {
  //                 select: {
  //                   id: true,
  //                   name: true,
  //                   breed: true,
  //                   age: true,
  //                 },
  //               },
  //               tasks: {
  //                 select: {
  //                   id: true,
  //                   type: true,
  //                   detail: true,
  //                   status: true,
  //                   createdAt: true,
  //                 },
  //               },
  //             },
  //           },
  //           customer: {
  //             select: {
  //               id: true,
  //               user: {
  //                 select: {
  //                   id: true,
  //                   email: true,
  //                   firstname: true,
  //                   lastname: true,
  //                 },
  //               },
  //             },
  //           },
  //           petsitter: {
  //             select: {
  //               id: true,
  //               user: {
  //                 select: {
  //                   id: true,
  //                   email: true,
  //                   firstname: true,
  //                   lastname: true,
  //                 },
  //               },
  //             },
  //           },
  //           progresses: {
  //             select: {
  //               id: true,
  //               content: true,
  //               images: true,
  //               createdAt: true,
  //             },
  //           },
  //         }
  //       });

  //       for (const activity of updatedActivities) {
  //         // send notification to customer
  //         const customer = activity.customer.user;
  //         const petsitter = activity.petsitter.user;
  //         console.log(`Send notification to customer ${customer.email} for activity ${activity.id} from IN_PROGRESS to RETURNING`);

  //         // send notification to petsitter
  //         await this.notificationService.create({
  //           title: 'Activity Returning',
  //           content: `The activity ${activity.title} is returning.`,
  //           userId: petsitter.id,
  //         });

  //         // send notification to customer
  //         await this.notificationService.create({
  //           title: 'Activity Returning',
  //           content: `The activity ${activity.title} is returning.`,
  //           userId: customer.id,
  //         });
  //       }

  //     }

  //   } catch (err: unknown) {
  //     console.error('Error in cron job:', err);
  //   }
  // }

  @Cron('*/16 * * * * *', {
    name: 'updateActivityStateFromPendingToCancelled',
    timeZone: 'Asia/Bangkok',
  })
  async handleCronUpdateActivityStateFromPendingToCancelled() {
    try {
      // if startDateTime <= now - 2 minutes and state = PENDING, then update state to CANCELLED
      const afterTwoMins = new Date();
      afterTwoMins.setMinutes(afterTwoMins.getMinutes() - 3); // 1 minutes later
      const updatedRecords = await this.prismaService.activity.updateMany({
        where: {
          AND: [
            { startDateTime: { lte: afterTwoMins } },
            { state: ActivityState.PENDING },
          ],
        },
        data: {
          state: ActivityState.CANCELLED,
        },
      });

      if (updatedRecords.count > 0) {
        const updatedActivities = await this.prismaService.activity.findMany({
          where: {
            startDateTime: { lte: afterTwoMins },
            state: ActivityState.CANCELLED,
          },
          orderBy: {
            updatedAt: 'desc',
          },
          take: updatedRecords.count,
          select: {
            id: true,
            title: true,
            detail: true,
            createdAt: true,
            updatedAt: true,
            startDateTime: true,
            endDateTime: true,
            price: true,
            pickupPoint: true,
            state: true,
            services: {
              select: {
                id: true,
                pet: {
                  select: {
                    id: true,
                    name: true,
                    breed: true,
                    age: true,
                  },
                },
                tasks: {
                  select: {
                    id: true,
                    type: true,
                    detail: true,
                    status: true,
                    createdAt: true,
                  },
                },
              },
            },
            customer: {
              select: {
                id: true,
                user: {
                  select: {
                    id: true,
                    email: true,
                    firstname: true,
                    lastname: true,
                  },
                },
              },
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
                  },
                },
              },
            },
            progresses: {
              select: {
                id: true,
                content: true,
                images: true,
                createdAt: true,
              },
            },
          }
        });

        for (const activity of updatedActivities) {
          // send notification to customer
          const customer = activity.customer.user;
          console.log(`Send notification to customer ${customer.email} for activity ${activity.id} from PENDING to CANCELLED`);

          // send notification to petsitter
          await this.notificationService.create({
            title: 'Activity Cancelled',
            content: `The activity ${activity.title} has been cancelled.`,
            userId: activity.customer.user.id,
          });
        }

      }

    } catch (err: unknown) {
      console.error('Error in cron job:', err);
    }
  }

  async getActivities(activityQueryDto: ActivityQueryDto, isAdmin: boolean) {
    const {
      animalTypeId,
      serviceType,
      startDate,
      endDate,
      page = GLOBAL_CONSTS.PAGE,
      limit = GLOBAL_CONSTS.LIMIT,
    } = activityQueryDto;
    const skip = (page - 1) * limit;
    let where = {} as Prisma.ActivityWhereInput;

    if (serviceType) {
      where.services = {
        some: {
          tasks: {
            some: { type: serviceType }
          }
        }
      };
    }

    if (animalTypeId) {
      await this.animalTypeService.getAnimalTypeById(animalTypeId);
      if (where.services) {
        where.services = {
          ...where.services,
          some: {
            ...where.services.some,
            pet: { animalTypeId },
          },
        };
      } else {
        where.services = {
          some: {
            pet: { animalTypeId },
          },
        };
      }
    }

    if (startDate && endDate) {
      where['startDateTime'] = { gte: startDate, lte: endDate };
    }

    if (!isAdmin) {
      where['state'] = ActivityState.PENDING;
    }

    const activities = await this.prismaService.activity.findMany({
      select: {
        id: true,
        title: true,
        detail: true,
        pickupPoint: true,
        startDateTime: true,
        endDateTime: true,
        price: true,
        createdAt: true,
        updatedAt: true,
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
                phone: true,
                role: true,
              },
            },
          },
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
                phone: true,
                role: true,
              },
            },
          },
        },
        services: {
          select: {
            id: true,
            pet: {
              select: {
                id: true,
                name: true,
                age: true,
                imageUrl: true,
                gender: true,
                personality: true,
                allergy: true,
                weight: true,
                otherDetail: true,
                animalType: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
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
                }
              },
            },
            tasks: {
              select: {
                id: true,
                type: true,
                detail: true,
                status: true,
                createdAt: true,
              },
            },
          },
        },
        state: true,
        progresses: {
          select: {
            id: true,
            content: true,
            images: true,
            createdAt: true,
          },
        },
        requests: {
          select: {
            id: true,
            createdAt: true,
            message: true,
            price: true,
            state: true,
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
                    phone: true,
                    role: true,
                  },
                },
              },
            },
          },
        },
      },
      where,
      skip,
      take: limit,
      orderBy: { createdAt: GLOBAL_CONSTS.ORDER as Prisma.SortOrder },
    });

    const total = await this.prismaService.activity.count({ where });

    return {
      data: activities,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    }
  }

  async getYourActivities(id: string): Promise<Partial<Activity>[]> {
    const customer = await this.prismaService.customer.findUnique({
      where: { id },
    });

    if (!customer) {
      throw new NotFoundException(`Customer not found`);
    }

    const activities = await this.prismaService.activity.findMany({
      where: {
        customerId: customer.id,
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        detail: true,
        createdAt: true,
        updatedAt: true,
        pickupPoint: true,
        price: true,
        startDateTime: true,
        endDateTime: true,
        state: true,
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
                      },
                    }
                  }
                },
                age: true,
                allergy: true,
                gender: true,
                imageUrl: true,
                personality: true,
                weight: true,
                otherDetail: true,
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
                type: true,
                detail: true,
                status: true,
                createdAt: true,
              },
            },
          },
        },
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
                phone: true,
                role: true,
              },
            },
          },
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
                phone: true,
                role: true,
              },
            },
          },
        },
        review: {
          select: {
            id: true,
            rating: true,
            content: true,
            createdAt: true,
            customerId: true,
            petsitterId: true,
          },
        },
        progresses: {
          select: {
            id: true,
            content: true,
            images: true,
            createdAt: true,
          },
        },
        requests: {
          select: {
            id: true,
            createdAt: true,
            message: true,
            price: true,
            state: true,
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
                    phone: true,
                    role: true,
                  },
                },
              },
            },
          }
        },
      }
    });

    return activities;
  }

  async getActivitiesByPetsitter(id: string, activityPetsitterQueryDto: ActivityPetsitterQueryDto) {
    const petsitter = await this.prismaService.petsitter.findUnique({
      where: { id },
      select: {
        id: true,
      },
    });

    if (!petsitter) {
      throw new NotFoundException(`Petsitter not found`);
    }

    const {
      state,
      page = GLOBAL_CONSTS.PAGE,
      limit = GLOBAL_CONSTS.LIMIT,
    } = activityPetsitterQueryDto;

    const skip = (page - 1) * limit;
    let where: Prisma.ActivityWhereInput = {
      petsitterId: petsitter.id,
    };

    if (state) {
      where.state = state;
    }

    const activities = await this.prismaService.activity.findMany({
      where,
      select: {
        id: true,
        title: true,
        detail: true,
        createdAt: true,
        updatedAt: true,
        pickupPoint: true,
        price: true,
        startDateTime: true,
        endDateTime: true,
        state: true,
        services: {
          select: {
            id: true,
            pet: {
              select: {
                id: true,
                name: true,
                age: true,
                allergy: true,
                weight: true,
                imageUrl: true,
                gender: true,
                otherDetail: true,
                personality: true,
                animalType: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
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
              },
            },
            tasks: {
              select: {
                id: true,
                type: true,
                detail: true,
                status: true,
                createdAt: true,
              },
            },
          },
        },
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
                phone: true,
                role: true,
              },
            },
          },
        },
        progresses: {
          select: {
            id: true,
            content: true,
            images: true,
            createdAt: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    const total = await this.prismaService.activity.count({ where });

    return {
      data: activities,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    }
  }

  async getActivityById(id: string): Promise<Partial<Activity>> {
    const activity = await this.prismaService.activity.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        title: true,
        detail: true,
        state: true,
        createdAt: true,
        updatedAt: true,
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
                phone: true,
                role: true,
              },
            },
          },
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
                phone: true,
                role: true,
              },
            },
          },
        },
        startDateTime: true,
        endDateTime: true,
        pickupPoint: true,
        price: true,
        services: {
          select: {
            id: true,
            pet: {
              select: {
                id: true,
                name: true,
                age: true,
                imageUrl: true,
                gender: true,
                allergy: true,
                weight: true,
                personality: true,
                otherDetail: true,
                animalType: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
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
              },
            },
            tasks: {
              select: {
                id: true,
                type: true,
                detail: true,
                status: true,
                createdAt: true,
              },
            },
          },
        },
        progresses: {
          select: {
            id: true,
            content: true,
            images: true,
            createdAt: true,
          },
        },
        requests: {
          select: {
            id: true,
            createdAt: true,
            message: true,
            price: true,
            state: true,
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
                    phone: true,
                    role: true,
                  },
                },
              },
            },
          }
        },
        review: {
          select: {
            id: true,
            rating: true,
            content: true,
            createdAt: true,
            customerId: true,
            petsitterId: true,
          }
        }
      }
    });

    if (!activity) {
      throw new NotFoundException(`Activity not found`);
    }
    return activity;
  }

  async createActivity(data: CreateActivityDto, id: string): Promise<Partial<Activity>> {
    const customer = await this.prismaService.customer.findUnique({
      where: { id },
    });

    if (!customer) {
      throw new NotFoundException(`Customer not found`);
    }

    const petIds = data.services.map(service => service.petId);
    const pets = await this.prismaService.pet.findMany({
      where: { id: { in: petIds }, ownerId: customer.id },
    });

    if (pets.length !== petIds.length) {
      throw new NotFoundException(`One or more pets not found or do not belong to the user`);
    }

    // check in same pet not allowed to have same task in same pet
    this.checkDuplicateTaskTypes(data.services);

    const { startDateTimeUtc, endDateTimeUtc } = validateAndConvertDateTimes(
      data.startDateTime,
      data.endDateTime,
      'UTC',
    );

    const overlappingActivities = await this.prismaService.activity.findMany({
      where: {
        services: {
          some: {
            petId: { in: petIds },
            activity: {
              startDateTime: { lte: endDateTimeUtc },
              endDateTime: { gte: startDateTimeUtc },
            },
          },
        },
        state: {
          not: ActivityState.CANCELLED,
        }
      },
    });

    if (overlappingActivities.length > 0) {
      throw new BadRequestException(
        'Some pets are in another activity with overlapping durations.',
      );
    }

    const activity = await this.prismaService.activity.create({
      data: {
        title: data.title,
        detail: data.detail,
        startDateTime: startDateTimeUtc,
        endDateTime: endDateTimeUtc,
        pickupPoint: data.pickupPoint,
        customer: {
          connect: { id: customer.id },
        },
        services: {
          create: data.services.map(service => ({
            pet: {
              connect: { id: service.petId },
            },
            tasks: {
              create: service.tasks,
            }
          })),
        },
      },
      select: {
        id: true,
        title: true,
        detail: true,
        state: true,
        createdAt: true,
        updatedAt: true,
        startDateTime: true,
        endDateTime: true,
        pickupPoint: true,
        price: true,
        services: {
          select: {
            id: true,
            pet: {
              select: {
                id: true,
                name: true,
                age: true,
                weight: true,
                gender: true,
                imageUrl: true,
                personality: true,
                allergy: true,
                otherDetail: true,
                animalType: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
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
                }
              },
            },
            tasks: {
              select: {
                id: true,
                type: true,
                detail: true,
                status: true,
                createdAt: true,
              },
            },
          },
        },
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
                phone: true,
                role: true,
              },
            },
          },
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
                phone: true,
                role: true,
              },
            },
          },
        },
        progresses: {
          select: {
            id: true,
            content: true,
            images: true,
            createdAt: true,
          },
        },
      },
    });

    return activity;
  }

  private checkDuplicateTaskTypes = (services) => {
    for (const service of services) {
      const petId = service.petId;
      const taskTypes = new Set();

      for (const task of service.tasks) {
        if (taskTypes.has(task.type)) {
          throw new BadRequestException(`Duplicate task type found for Pet ID ${petId}: ${task.type}`);
        } else {
          taskTypes.add(task.type);
        }
      }
    }
  };

  async updateActivityStateToReturning(id: string): Promise<void> {
    const activity = await this.prismaService.activity.findUnique({
      where: { id },
      select: {
        state: true, customer: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
              }
            }
          }
        }
      },
    });

    if (!activity) {
      throw new NotFoundException(`Activity not found`);
    }

    if (activity.state !== ActivityState.IN_PROGRESS) {
      throw new BadRequestException(`You can only update activity state to RETURNING for an activity in the IN_PROGRESS state.`);
    }

    await this.prismaService.activity.update({
      where: { id },
      data: { state: ActivityState.RETURNING },
    });

    await this.notificationService.create({
      title: 'Activity Returning',
      content: `The activity is returning.`,
      userId: activity.customer.user.id,
    });
  }

  async updateActivityState(id: string, state: ActivityState): Promise<void> {
    const activity = await this.prismaService.activity.findUnique({
      where: { id },
      select: {
        state: true,
        customer: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
              }
            },
          },
        },
        petsitter: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
              }
            },
          },
        }
      },
    });

    if (!activity) {
      throw new NotFoundException(`Activity not found`);
    }

    let data = {} as Prisma.ActivityUpdateInput;
    switch (activity.state) {
      case ActivityState.PENDING:
        if (state === ActivityState.ASSIGNED) {
          data = { state };
        } else if (state === ActivityState.CANCELLED) {
          data = { state };
        } else {
          throw new BadRequestException(`Invalid state transition from PENDING to ${state}`);
        }
        break;
      case ActivityState.ASSIGNED:
        if (state === ActivityState.CANCELLED) {
          data = { state };
        } else {
          throw new BadRequestException(`Invalid state transition from ASSIGNED to ${state}`);
        }
        break;
      case ActivityState.IN_PROGRESS:
        if (state === ActivityState.RETURNING) {
          const services = await this.prismaService.activityService.findMany({
            where: { activityId: id },
          });

          // const allServicesCompleted = services.every(service => service.status === true);
          // if (!allServicesCompleted) {
          //   throw new BadRequestException(`All services must be completed before the activity can be marked as COMPLETED`);
          // }

          // const progresses = await this.prismaService.activityProgress.count({
          //   where: { activityId: id },
          // });

          // if (progresses < services.length) {
          //   throw new BadRequestException(`All services must have progress before the activity can be marked as COMPLETED`);
          // }

          data = { state };
        } else {
          throw new BadRequestException(`Invalid state transition from IN_PROGRESS to ${state}`);
        }
        break;
      case ActivityState.RETURNING:
        if (state === ActivityState.COMPLETED) {
          data = { state };
        } else if (state === ActivityState.FAILED) {
          data = { state };
        } else {
          throw new BadRequestException(`Invalid state transition from RETURNING to ${state}`);
        }
        await Promise.all([
          this.notificationService.create({
            title: 'Activity Completed',
            content: `The activity is completed.`,
            userId: activity.customer.user.id,
          }),
          this.notificationService.create({
            title: 'Activity Completed',
            content: `The activity is completed.`,
            userId: activity.petsitter.user.id,
          }),
        ]);
        break;

      default:
        throw new BadRequestException(`Invalid state transition from ${activity.state} to ${state}`);
    }

    await this.prismaService.activity.update({
      where: { id },
      data,
    });

  }

  async updateActivityStateByPetsitter(id: string, state: ActivityState, petsitterId: string): Promise<void> {
    const activity = await this.prismaService.activity.findUnique({
      where: { id },
      select: { state: true },
    });

    if (!activity) {
      throw new NotFoundException(`Activity not found`);
    }

    if (activity.state !== ActivityState.IN_PROGRESS) {
      throw new BadRequestException(`You can only update activity state for an activity in the IN_PROGRESS state.`);
    }

    if (state !== ActivityState.ASSIGNED && state !== ActivityState.REJECTED && state !== ActivityState.COMPLETED) {
      throw new BadRequestException(`Invalid state transition from PENDING to ${state}`);
    }

    await this.prismaService.activity.update({
      where: { id },
      data: {
        state,
        petsitter: {
          connect: { id: petsitterId },
        },
      },
    });

    console.log(`Activity ${id} has been ${state === ActivityState.ASSIGNED ? 'assigned' : 'rejected'} to petsitter ${petsitterId}`);
  }

  async updateActivityPetsitterState(id: string, state: ActivityState, petsitterId: string, price: number): Promise<void> {
    const activity = await this.prismaService.activity.findUnique({
      where: { id },
      select: { state: true },
    });

    if (!activity) {
      throw new NotFoundException(`Activity not found`);
    }

    if (activity.state !== ActivityState.PENDING) {
      throw new BadRequestException(`You can only accept or reject an activity in the PENDING state.`);
    }

    await this.prismaService.activity.update({
      where: { id },
      data: {
        state,
        petsitter: {
          connect: { id: petsitterId },
        },
        price,
      },
    });

    console.log(`Activity ${id} has been ${state === ActivityState.ASSIGNED ? 'assigned' : 'rejected'} to petsitter ${petsitterId}`);
  }

  async deleteAllActivities(): Promise<void> {
    await this.prismaService.activity.deleteMany({});
  }

  async deleteActivityById(id: string): Promise<void> {
    const activity = await this.prismaService.activity.findUnique({
      where: { id },
    });

    if (!activity) {
      throw new NotFoundException(`Activity not found`);
    }

    await this.prismaService.activity.delete({
      where: { id },
    });
  }

  async deleteActivityByCustomerId(id: string): Promise<void> {
    const customer = await this.prismaService.customer.findUnique({
      where: { id },
    });

    if (!customer) {
      throw new NotFoundException(`Customer not found`);
    }

    await this.prismaService.activity.deleteMany({
      where: { customerId: customer.id },
    });
  }

  // new
  async createProgress(id: string, petsitterId: string, data: CreateProgressDto, images: string[]): Promise<Partial<ActivityProgress>> {
    const activity = await this.prismaService.activity.findUnique({
      where: { id },
      select: { state: true, petsitterId: true },
    });

    if (!activity || activity.petsitterId !== petsitterId) {
      throw new BadRequestException(`You are not authorized to create progress for this activity.`);
    }

    if (activity.state !== ActivityState.IN_PROGRESS) {
      throw new BadRequestException(`You can only create progress for an activity in the IN_PROGRESS state.`);
    }

    const progress = await this.prismaService.activityProgress.create({
      data: {
        content: data.content,
        activity: {
          connect: { id },
        },
        images,
      },
      select: {
        id: true,
        content: true,
        images: true,
        createdAt: true,
      },
    });

    return progress;
  }

  // new
  async getProgressesByActivityId(activityId: string, user: User): Promise<Partial<ActivityProgress>[]> {
    const activityExists = await this.prismaService.activity.findUnique({
      where: { id: activityId },
    });

    if (!activityExists) {
      throw new NotFoundException(`Activity with ID ${activityId} not found.`);
    }

    switch (user.role) {
      case Role.CUSTOMER:
        if (activityExists.customerId !== user['customer']['id']) {
          throw new BadRequestException(`You are not authorized to view this activity's progress.`);
        }
        break;
      case Role.PETSITTER:
        if (activityExists.petsitterId !== user['petsitter']['id']) {
          throw new BadRequestException(`You are not authorized to view this activity's progress.`);
        }
        break;
    }

    const progresses = await this.prismaService.activityProgress.findMany({
      where: { activityId },
      select: {
        id: true,
        content: true,
        images: true,
        createdAt: true,
        activityId: true,
      },
    });

    return progresses;
  }

  // new
  async updateTaskStatus(id: string, petsitterId: string, taskId: string, status: boolean): Promise<void> {
    const task = await this.prismaService.task.findUnique({
      where: { id: taskId },
      select: { status: true, id: true },
    });

    if (!task) {
      throw new NotFoundException(`Task not found`);
    }

    const activity = await this.prismaService.activity.findUnique({
      where: { id },
      select: { state: true, petsitterId: true },
    });

    if (!activity || activity.petsitterId !== petsitterId) {
      throw new BadRequestException(`You are not authorized to update task status for this activity.`);
    }

    if (activity.state !== ActivityState.IN_PROGRESS) {
      throw new BadRequestException(`You can only update task status for an activity in the IN_PROGRESS state.`);
    }

    if (task.status === status) {
      throw new BadRequestException(`Task status is already ${status ? 'completed' : 'incomplete'}`);
    }

    await this.prismaService.task.update({
      where: { id: taskId },
      data: { status },
    });
  }
}
