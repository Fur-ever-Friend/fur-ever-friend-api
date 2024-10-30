import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ActivityState, State } from '@prisma/client';

import { CreateRequestDto, GetRequestResponseDto } from './dto';
import { convertToUtc } from '@/common/utils';
import { PaymentService } from '../payment/payment.service';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityService } from '../activity/activity.service';
import { NotificationService } from '../notification/notification.service';
import { title } from 'process';

@Injectable()
export class RequestService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly paymentService: PaymentService,
    private readonly activityService: ActivityService,
    private readonly notificationService: NotificationService,
  ) { }

  async getAllRequests(): Promise<GetRequestResponseDto[]> {
    const requests = await this.prismaService.petsitterRequest.findMany({
      include: { activity: true, petsitter: { include: { user: true } } },
    });

    return requests.map(GetRequestResponseDto.formatRequestResponse);
  }

  async createRequest(id: string, createRequestDto: CreateRequestDto) {
    const { activityId, price } = createRequestDto;

    const activity = await this.prismaService.activity.findUnique({
      where: { id: activityId },
    });

    if (!activity) {
      throw new NotFoundException(`Activity not found`);
    }

    const petsitter = await this.prismaService.petsitter.findUnique({
      where: { id },
    });

    if (!petsitter) {
      throw new NotFoundException('Petsitter not found');
    }

    if (price < 20 || price > 500) {
      throw new BadRequestException('The service price must be between $20 and $500.');
    }

    const existingRequest = await this.prismaService.petsitterRequest.findFirst({
      where: { petsitterId: petsitter.id, activityId },
    });

    if (existingRequest) {
      throw new BadRequestException('You have already requested to this activity');
    }

    const startDateTimeUtc = convertToUtc(activity.startDateTime);
    const endDateTimeUtc = convertToUtc(activity.endDateTime);

    const overlappingActivity = await this.prismaService.activity.findFirst({
      where: {
        petsitterId: petsitter.id,
        startDateTime: { lte: endDateTimeUtc },
        endDateTime: { gte: startDateTimeUtc },
      },
    });

    if (overlappingActivity) {
      throw new BadRequestException(
        'The requested activity time overlaps with another activity assigned to this petsitter.',
      );
    }

    return this.prismaService.petsitterRequest.create({
      data: {
        petsitter: { connect: { id: petsitter.id } },
        activity: { connect: { id: activityId } },
        price: createRequestDto.price,
        message: createRequestDto.message,
      },
    });
  }

  async getRequestsByPetsitter(id: string) {
    const petsitter = await this.prismaService.petsitter.findUnique({
      where: { id },
    });

    if (!petsitter) {
      throw new NotFoundException('Petsitter not found');
    }

    const requests = await this.prismaService.petsitterRequest.findMany({
      where: { petsitterId: petsitter.id, state: State.PENDING },
      select: {
        id: true,
        price: true,
        message: true,
        state: true,
        createdAt: true,
        activity: {
          select: {
            id: true,
            title: true,
            detail: true,
            price: true,
            startDateTime: true,
            endDateTime: true,
            pickupPoint: true,
            createdAt: true,
            customer: {
              select: {
                id: true,
                user: {
                  select: {
                    id: true,
                    email: true,
                    phone: true,
                    firstname: true,
                    lastname: true,
                    avatar: true,
                  },
                },
              },
            },
            state: true,
            services: {
              select: {
                id: true,
                pet: {
                  select: {
                    id: true,
                    name: true,
                    age: true,
                    gender: true,
                    imageUrl: true,
                    personality: true,
                    allergy: true,
                    otherDetail: true,
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
                      },
                    },
                    animalType: {
                      select: {
                        id: true,
                        name: true,
                      },
                    },
                    weight: true,
                  },
                },
                tasks: {
                  select: {
                    id: true,
                    activityServiceId: true,
                    createdAt: true,
                    detail: true,
                    type: true,
                    status: true,
                  },
                },
              },
            },
          },
        },
      }
    });

    const formattedRequests = requests.map((request) => {
      return {
        id: request.activity.id,
        title: request.activity.title,
        price: request.activity.price,
        detail: request.activity.detail,
        startDateTime: request.activity.startDateTime,
        endDateTime: request.activity.endDateTime,
        pickupPoint: request.activity.pickupPoint,
        createdAt: request.activity.createdAt,
        customer: request.activity.customer.user,
        state: request.activity.state,
        services: request.activity.services,
        request: {
          id: request.id,
          price: request.price,
          message: request.message,
          state: request.state,
          createdAt: request.createdAt,
        },
      };
    });

    return formattedRequests;
  }

  async getRequestsByActivity(activityId: string): Promise<GetRequestResponseDto[]> {
    const requests = await this.prismaService.petsitterRequest.findMany({
      where: { activityId },
      include: { activity: true, petsitter: { include: { user: true } } },
    });

    return requests.map(GetRequestResponseDto.formatRequestResponse);
  }

  async acceptRequest(id: string, customerId: string) {
    const customer = await this.prismaService.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      throw new NotFoundException(`Customer not found`);
    }

    const request = await this.prismaService.petsitterRequest.findUnique({
      where: { id },
      select: {
        id: true,
        price: true,
        state: true,
        activityId: true,
        petsitter: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
              },
            },
          },
        }
      }
    });

    if (!request) {
      throw new NotFoundException('Request not found');
    }

    if (request.state !== State.PENDING) {
      throw new BadRequestException('The request is not pending');
    }

    const activity = await this.prismaService.activity.findUnique({
      where: {
        id: request.activityId,
      },
      select: {
        id: true,
        state: true,
      },
    });

    if (!activity) {
      throw new BadRequestException('Activity not found');
    }

    if (activity.state !== ActivityState.PENDING) {
      throw new BadRequestException('The activity is not pending');
    }

    const payment = await this.paymentService.createPayment({ activityId: request.activityId, amount: request.price });

    await this.activityService.updateActivityPetsitterState(request.activityId, ActivityState.ASSIGNED, request.petsitter.id, request.price);

    await this.notificationService.create({
      title: 'Request Accepted',
      content: `Your request for the activity has been accepted.`,
      userId: request.petsitter.user.id,
    });

    await this.prismaService.petsitterRequest.update({
      where: { id: request.id, state: State.PENDING },
      data: { state: State.ACCEPTED },
    });

    // get all requests for the activity
    const requests = await this.prismaService.petsitterRequest.findMany({
      where: { activityId: request.activityId, state: State.PENDING },
      select: {
        id: true,
        state: true,
        petsitter: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    // reject all other requests
    for (const req of requests) {
      if (req.id !== request.id) {
        await this.notificationService.create({
          title: 'Request Rejected',
          content: `Your request for the activity has been rejected.`,
          userId: req.petsitter.user.id,
        });

        await this.prismaService.petsitterRequest.update({
          where: { id: req.id },
          data: { state: State.REJECTED },
        });
      }
    }

    return payment;
  }
}
