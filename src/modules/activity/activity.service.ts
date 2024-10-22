import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateActivityDto } from './dto';

@Injectable()
export class ActivityService {
  private readonly logger = new Logger(ActivityService.name);
  constructor(private readonly prismaService: PrismaService) {}

  async getActivities() {
    try {
      this.logger.log('Fetching all activities');
      return await this.prismaService.activity.findMany();
    } catch (error) {
      this.logger.error('Failed to fetch activities', error.stack);
      throw new InternalServerErrorException('Failed to fetch activities');
    }
  }

  async getActivityById(id: string) {
    return this.prismaService.activity.findUnique({
      where: {
        id,
      },
    });
  }

  async createActivity({ data, userId }: {
    data: CreateActivityDto, userId: string
  }) {
    try {
      this.logger.log('Creating activity with data:', data);

      // Fetch the customer record associated with the user
      const customer = await this.prismaService.customer.findUnique({
        where: { userId },
      });

      if (!customer) {
        throw new NotFoundException(`Customer with userId ${userId} not found`);
      }

      const activity = await this.prismaService.activity.create({
        data: {
          ...data,
          customer: {
            connect: { id: customer.id },
          },
        },
      });

      this.logger.log('Activity created successfully:', activity);

      return activity;
    } catch (error) {
      this.logger.error('Failed to create activity', error.stack);
      throw new InternalServerErrorException('Failed to create activity');
    }
  }
}
