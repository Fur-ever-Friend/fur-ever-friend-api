import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateActivityDto } from './dto';

@Injectable()
export class ActivityService {
  private readonly logger = new Logger(ActivityService.name);
  constructor(private readonly prismaService: PrismaService) {}

  async getActivities() {
    return await this.prismaService.activity.findMany();
  }

  async getActivityById(id: string) {
    const activity = this.prismaService.activity.findUnique({
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

    const overlappingActivities = await this.prismaService.activity.findMany({
      where: {
        petId: data.petId,
        OR: [
          {
            startDateTime: { lte: data.endDateTime },
            endDateTime: { gte: data.startDateTime },
          },
        ],
      },
    });

    if (overlappingActivities.length > 0) {
      throw new BadRequestException(
        'The pet is already booked for another activity during the selected time',
      );
    }

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
  }
}
