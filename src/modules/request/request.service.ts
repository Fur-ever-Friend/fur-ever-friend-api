import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRequestDto } from './dto/create-request.dto';

@Injectable()
export class RequestService {
  constructor(private readonly prismaService: PrismaService) {}

  async createRequest(userId: string, createRequestDto: CreateRequestDto) {
    const { activityId } = createRequestDto;

    const activity = await this.prismaService.activity.findUnique({
      where: { id: activityId },
    });

    if (!activity) {
      throw new NotFoundException(`Activity not found`);
    }

    const petsitter = await this.prismaService.petsitter.findUnique({
      where: { userId },
    });

    if (!petsitter) {
      throw new BadRequestException('Only petsitters can request to activities');
    }

    const existingRequest = await this.prismaService.petsitterRequest.findFirst({
      where: { petsitterId: petsitter.id, activityId },
    });

    if (existingRequest) {
      throw new BadRequestException('You have already requested to this activity');
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

  async getRequestsByPetsitter(userId: string) {
    const petsitter = await this.prismaService.petsitter.findUnique({
      where: { userId },
    });

    if (!petsitter) {
      throw new NotFoundException('Petsitter not found');
    }

    return this.prismaService.petsitterRequest.findMany({
      where: { petsitterId: petsitter.id },
      include: { activity: true },
    });
  }

  async getRequestsByActivity(activityId: string) {
    return this.prismaService.petsitterRequest.findMany({
      where: { activityId },
      include: { petsitter: { include: { user: true } } },
    });
  }

  async acceptRequest(userId: string, requestId: string) {
    const customer = await this.prismaService.customer.findUnique({
      where: { userId },
    });

    if (!customer) {
      throw new NotFoundException(`Customer not found`);
    }

    const request = await this.prismaService.petsitterRequest.findUnique({
      where: { id: requestId },
      include: { activity: true, petsitter: true },
    });

    if (!request) {
      throw new NotFoundException('Request not found');
    }

    const activity = await this.prismaService.activity.findUnique({
      where: { id: request.activityId },
    });

    if (!activity) {
      throw new NotFoundException('Activity not found');
    }

    if (activity.customerId !== customer.id) {
      throw new BadRequestException('You are not authorized to accept this request');
    }

    await this.prismaService.activity.update({
      where: { id: activity.id },
      data: {
        petsitterId: request.petsitterId,
        state: 'ASSIGNED',
      },
    });

    await this.prismaService.petsitterRequest.update({
      where: { id: requestId },
      data: { state: 'ACCEPTED' },
    });

    await this.prismaService.petsitterRequest.updateMany({
      where: {
        activityId: activity.id,
        id: { not: requestId },
      },
      data: { state: 'REJECTED' },
    });

    return { message: 'Request accepted and petsitter assigned to the activity' };
  }
}
