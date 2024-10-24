import { Body, Controller, Get, Logger, Param, Patch, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiTags,
  ApiOkResponse,
} from '@nestjs/swagger';
import { ActivityService } from './activity.service';
import { ActivityResponseDto } from './dto';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { CreateActivityDto } from './dto/request/create-activity.dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';

import { Activity, Role, User } from '@prisma/client';
import { Roles } from '@/common/decorators/roles.decorator';

@ApiTags('activities')
@ApiBearerAuth()
@Controller('activities')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ActivityController {
  private readonly logger = new Logger(ActivityController.name);
  constructor(private readonly activityService: ActivityService) {}

  @ApiOperation({ summary: 'Get all activities' })
  @ApiOkResponse({ status: 200 })
  @Get()
  async getAllActivities(): Promise<ActivityResponseDto[]> {
    return this.activityService.getActivities();
  }

  @ApiOperation({ summary: 'Get your activities' })
  @ApiOkResponse({ status: 200 })
  @Get('me')
  @Roles(Role.CUSTOMER)
  async getYourActivities(@CurrentUser() user: User): Promise<Activity[]> {
    return this.activityService.getYourActivities(user.id);
  }

  @ApiOperation({ summary: 'Get activities by id' })
  @ApiOkResponse({ status: 200 })
  @Get(':id')
  async getActivityById(@Param('id') id: string): Promise<Activity> {
    return this.activityService.getActivityById(id);
  }
  
  @ApiBody({ type: CreateActivityDto })
  @ApiOperation({ summary: 'Create activity' })
  @ApiOkResponse({ status: 201 })
  @Post()
  @Roles(Role.CUSTOMER)
  async createActivity(@CurrentUser() user: User, @Body() data: CreateActivityDto) {
    return this.activityService.createActivity(data, user.id);
  }

  @ApiOperation({ summary: 'Update activity state to RETURNING' })
  @ApiOkResponse({ status: 200 })
  @Patch(':id/returning')
  @Roles(Role.CUSTOMER, Role.PETSITTER)
  async updateActivityToReturning(@Param('id') id: string) {
    return this.activityService.updateActivityToReturning(id);
  }

  @ApiOperation({ summary: 'Update activity state to COMPLETED' })
  @ApiOkResponse({ status: 200 })
  @Patch(':id/completed')
  @Roles(Role.CUSTOMER, Role.PETSITTER)
  async updateActivityToCompleted(@Param('id') id: string) {
    return this.activityService.updateActivityToCompleted(id);
  }

  @ApiOperation({ summary: 'Cancel activity' })
  @ApiOkResponse({ status: 200 })
  @Patch(':id/cancel')
  @Roles(Role.CUSTOMER)
  async cancelActivity(@Param('id') id: string, @CurrentUser() user: User) {
    return this.activityService.cancelActivity(id, user.id);
  }
}