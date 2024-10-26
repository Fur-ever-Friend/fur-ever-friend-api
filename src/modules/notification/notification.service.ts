import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationService {
  constructor(private readonly prismaService: PrismaService) { }
  async create(createNotificationDto: CreateNotificationDto) {
    const { title, content, userId } = createNotificationDto;
    return this.prismaService.notification.create({
      data: {
        title,
        content,
        userId,
      },
      select: {
        id: true,
        title: true,
        content: true,
        userId: true,
      }
    });
  }

  async findAll() {
    const notifications = await this.prismaService.notification.findMany({
      select: {
        id: true,
        title: true,
        content: true,
        userId: true,
      }
    });

    return notifications;
  }

  async findAllByUserId(userId: string) {
    const notifications = await this.prismaService.notification.findMany({
      where: { userId },
      select: {
        id: true,
        title: true,
        content: true,
        userId: true,
      }
    });

    return notifications;
  }

  async findOne(id: string) {
    const notification = await this.prismaService.notification.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        content: true,
        userId: true,
      }
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return notification;
  }

  async findOneByIdAndUserId(id: string, userId: string) {
    const notification = await this.prismaService.notification.findUnique({
      where: { id, userId },
      select: {
        id: true,
        title: true,
        content: true,
        userId: true,
      }
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return notification;
  }

}
