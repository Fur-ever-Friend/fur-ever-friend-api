import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ActivityState, State } from '@prisma/client';

import { CreateRequestDto, GetRequestResponseDto } from './dto';
import { convertToUtc } from '@/common/utils';
import { PaymentService } from '../payment/payment.service';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityService } from '../activity/activity.service';
import { NotificationService } from '../notification/notification.service';

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

  async getRequestsByPetsitter(id: string): Promise<GetRequestResponseDto[]> {
    const petsitter = await this.prismaService.petsitter.findUnique({
      where: { id },
    });

    if (!petsitter) {
      throw new NotFoundException('Petsitter not found');
    }

    const requests = await this.prismaService.petsitterRequest.findMany({
      where: { petsitterId: petsitter.id },
      include: { activity: true },
    });

    return requests.map(GetRequestResponseDto.formatRequestResponse);
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

    const payment = await this.paymentService.createPayment({ activityId: request.activityId, amount: request.price });

    await this.notificationService.create({
      title: 'Request Accepted',
      content: `Your request for the activity has been accepted. Please proceed to payment.`,
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

    await this.activityService.updateActivityPetsitterState(request.activityId, ActivityState.ASSIGNED, request.petsitter.id, request.price);

    return payment;
  }
}
