import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRequestDto } from './dto/request/create-request.dto';
import { convertToUtc } from '@/common/utils';
import { GetRequestResponseDto } from './dto';

@Injectable()
export class RequestService {
  constructor(private readonly prismaService: PrismaService) {}

  async createRequest(userId: string, createRequestDto: CreateRequestDto) {
    const { activityId, price } = createRequestDto;

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

  async getRequestsByPetsitter(userId: string): Promise<GetRequestResponseDto[]> {
    const petsitter = await this.prismaService.petsitter.findUnique({
      where: { userId },
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
        price: request.price,
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

    return { message: 'Request accepted and petsitter assigned to an activity' };
  }
}
