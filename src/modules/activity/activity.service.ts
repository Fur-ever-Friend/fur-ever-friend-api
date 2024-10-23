import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateActivityDto } from './dto';
import { ActivityResponseDto } from './dto/response/activity-response.dto';
import { validateAndConvertDateTimes } from '@/common/utils';
import { ActivityState } from '@prisma/client';

@Injectable()
export class ActivityService {
  private readonly logger = new Logger(ActivityService.name);
  constructor(private readonly prismaService: PrismaService) {}

  async getActivities(): Promise<ActivityResponseDto[]> {
    const activities = await this.prismaService.activity.findMany({
      select: ActivityResponseDto.selectFields(),
    });
    return activities.map(ActivityResponseDto.formatActivityResponse);
  }

  async getYourActivities(userId: string): Promise<ActivityResponseDto[]> {
    const customer = await this.prismaService.customer.findUnique({
      where: { userId },
    });

    if (!customer) {
      throw new NotFoundException(`Customer not found`);
    }

    const activities = await this.prismaService.activity.findMany({
      where: {
        customerId: customer.id,
      },
      select: ActivityResponseDto.selectFields(),
    });

    return activities.map(ActivityResponseDto.formatActivityResponse);
  }

  async getActivityById(id: string): Promise<ActivityResponseDto> {
    const activity = await this.prismaService.activity.findUnique({
      where: {
        id,
      },
    });

    if (!activity) {
      throw new NotFoundException(`Activity not found`);
    }
    return activity;
  }

  async createActivity(data: CreateActivityDto, userId: string) {
    const customer = await this.prismaService.customer.findUnique({
      where: { userId },
    });

    if (!customer) {
      throw new NotFoundException(`Customer not found`);
    }

    const pet = await this.prismaService.pet.findUnique({
      where: { id: data.petId },
    });

    if (!pet || pet.ownerId !== customer.id) {
      throw new NotFoundException(`Pet not found or does not belong to the user`);
    }

    // Validate and convert date times
    const { startDateTimeUtc, endDateTimeUtc } = validateAndConvertDateTimes(
      data.startDateTime,
      data.endDateTime,
    );

    const overlappingActivities = await this.prismaService.activity.findMany({
      where: {
        petId: data.petId,
        OR: [
          {
            startDateTime: { lte: startDateTimeUtc },
            endDateTime: { gte: endDateTimeUtc },
          },
        ],
      },
    });

    if (overlappingActivities.length > 0) {
      throw new BadRequestException(
        'Some pets are in another activity with overlapping durations.',
      );
    }

    try {
      const activity = await this.prismaService.activity.create({
      data: {
        name: data.name,
        detail: data.detail,
        startDateTime: data.startDateTime,
        endDateTime: data.endDateTime,
        pickupPoint: data.pickupPoint,
        customer: {
        connect: { id: customer.id },
        },
        pet: {
        connect: { id: data.petId },
        },
        services: {
        create: data.services.map(service => ({
          detail: service.detail,
          serviceType: service.serviceType,
          pet: {
          connect: { id: data.petId },
          },
        })),
        },
      },
      include: {
        customer: true,
        pet: true,
        services: true,
      },
      });
      return activity;
    } catch (error) {
      this.logger.error('Error creating activity', error.stack);
      throw new BadRequestException('Failed to create activity');
    }

  }
}
