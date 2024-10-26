import { Controller, Get, Post, Body, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { Role, User } from '@prisma/client';

import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { Id } from '@/common/global-dtos/id-query.dto';
import { Roles } from '@/common/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) { }

  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createNotificationDto: CreateNotificationDto) {
    const result = await this.notificationService.create(createNotificationDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Notification created successfully.',
      data: result,
    }
  }

  @Roles(Role.ADMIN, Role.CUSTOMER, Role.PETSITTER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  async findAll(@CurrentUser() user: User) {
    let result: Partial<Notification>[] = [];
    if (user.role === Role.ADMIN) {
      result = await this.notificationService.findAll();
    } else {
      result = await this.notificationService.findAllByUserId(user.id);
    }

    return {
      statusCode: HttpStatus.OK,
      message: 'Notifications fetched successfully.',
      data: result,
    }
  }

  @Roles(Role.ADMIN, Role.CUSTOMER, Role.PETSITTER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':id')
  async findOne(@Param() { id }: Id, @CurrentUser() user: User) {
    let result: Partial<Notification>;
    if (user.role === Role.ADMIN) {
      result = await this.notificationService.findOne(id);
    } else {
      result = await this.notificationService.findOneByIdAndUserId(id, user.id);
    }

    return {
      statusCode: HttpStatus.OK,
      message: 'Notification fetched successfully.',
      data: result,
    }
  }

}
