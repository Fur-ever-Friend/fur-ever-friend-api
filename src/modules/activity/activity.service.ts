import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateActivityDto } from './dto/request/create-activity.dto';
import { ActivityResponseDto } from './dto/response/activity-response.dto';
import { validateAndConvertDateTimes } from '@/common/utils/date-time-utils';
import { Activity } from '@prisma/client';
import * as cron from 'node-cron';

@Injectable()
export class ActivityService {
  constructor(private readonly prismaService: PrismaService) {
    cron.schedule('* * * * *', () => {
      this.updateAssignedActivitiesToInProgress();
    });

    cron.schedule('0 * * * *', () => {
      this.updateInProgressActivitiesToReturning();
    });

    cron.schedule('0 0 * * *', () => {
      this.updateReturningActivitiesToCompleted();
    });
  }

  async getActivities(): Promise<ActivityResponseDto[]> {
    const activities = await this.prismaService.activity.findMany({
      select: ActivityResponseDto.selectFields(),
    });
    return activities.map(ActivityResponseDto.formatActivityResponse);
  }

  async getYourActivities(userId: string): Promise<Activity[]> {
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
      include: {
        services: true,
      },
    });

    return activities.map(ActivityResponseDto.formatActivityResponse);
  }

  async getActivityById(id: string): Promise<Activity> {
    const activity = await this.prismaService.activity.findUnique({
      where: {
        id,
      },
      include: {
        services: true,
      },
    });

    if (!activity) {
      throw new NotFoundException(`Activity not found`);
    }
    return activity;
  }

  async createActivity(data: CreateActivityDto, userId: string): Promise<ActivityResponseDto> {
    const customer = await this.prismaService.customer.findUnique({
      where: { userId },
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

    // Validate and convert date times
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
          startDateTime: startDateTimeUtc,
          endDateTime: endDateTimeUtc,
          pickupPoint: data.pickupPoint,
          customer: {
            connect: { id: customer.id },
          },
          services: {
            create: data.services.map(service => ({
              detail: service.detail,
              serviceType: service.serviceType,
              pet: {
                connect: { id: service.petId },
              },
            })),
          },
        },
        include: {
          services: true,
        },
      });

      return ActivityResponseDto.formatActivityResponse(activity);
    } catch (error) {
      throw new BadRequestException(`Error creating activity: ${error.message}`);
    }
  }

  async updateAssignedActivitiesToInProgress() {
    const now = new Date();

    const activities = await this.prismaService.activity.findMany({
      where: {
        startDateTime: { lte: now },
        state: 'ASSIGNED',
      },
      include: {
        services: true,
      },
    });

    for (const activity of activities) {
      await this.prismaService.activity.update({
        where: { id: activity.id },
        data: { state: 'IN_PROGRESS' },
      });

      await this.prismaService.activityService.updateMany({
        where: { activityId: activity.id },
        data: { status: 'IN_PROGRESS' },
      });
    }
  }

  async updateActivityToReturning(id: string) {
    const activity = await this.prismaService.activity.findUnique({
      where: { id },
    });

    if (!activity) {
      throw new NotFoundException(`Activity not found`);
    }

    await this.prismaService.activity.update({
      where: { id },
      data: { state: 'RETURNING' },
    });

    return { message: 'Activity state updated to RETURNING' };
  }

  async updateActivityToCompleted(id: string) {
    const activity = await this.prismaService.activity.findUnique({
      where: { id },
    });

    if (!activity) {
      throw new NotFoundException(`Activity not found`);
    }

    await this.prismaService.activity.update({
      where: { id },
      data: { state: 'COMPLETED' },
    });

    return { message: 'Activity state updated to COMPLETED' };
  }

  async updateInProgressActivitiesToReturning() {
    const now = new Date();

    const activities = await this.prismaService.activity.findMany({
      where: {
        endDateTime: { lte: now },
        state: 'IN_PROGRESS',
      },
    });

    for (const activity of activities) {
      await this.prismaService.activity.update({
        where: { id: activity.id },
        data: { state: 'RETURNING' },
      });
    }
  }

  async updateReturningActivitiesToCompleted() {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const activities = await this.prismaService.activity.findMany({
      where: {
        endDateTime: { lte: oneDayAgo },
        state: 'RETURNING',
      },
    });

    for (const activity of activities) {
      await this.prismaService.activity.update({
        where: { id: activity.id },
        data: { state: 'COMPLETED' },
      });
    }
  }

  async cancelActivity(id: string, userId: string) {
    const activity = await this.prismaService.activity.findUnique({
      where: { id },
      include: { customer: true },
    });

    if (!activity) {
      throw new NotFoundException(`Activity not found`);
    }

    if (activity.customer.userId !== userId) {
      throw new BadRequestException('You are not authorized to cancel this activity');
    }

    await this.prismaService.activity.update({
      where: { id },
      data: { state: 'CANCELLED' },
    });

    return { message: 'Activity state updated to CANCELLED' };
  }
}
