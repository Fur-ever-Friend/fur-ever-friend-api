import { Body, Controller, Get, Logger, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ActivityService } from './activity.service';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { CreateActivityDto } from './dto/create-activity.dto';

import { User } from '@prisma/client';


@ApiTags('activities')
@Controller('activities')
export class ActivityController {
  private readonly logger = new Logger(ActivityController.name);
  constructor(private readonly activityService: ActivityService) {}

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all activities' })
  @ApiResponse({ status: 200, description: 'List of all activities' })
  async getAllActivities() {
    return this.activityService.getActivities();
  }

  @Get(':id')
  async getActivityById(@Param('id') id: string) {
    return this.activityService.getActivityById(id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create activity' })
  @ApiBody({ type: CreateActivityDto })
  @ApiResponse({ status: 201, description: 'The record has been successfully created.'})
  @UseGuards(JwtAuthGuard)
  @Post()
  async createActivity(
    @CurrentUser() user: User,
    @Body() data: CreateActivityDto,
  ) {
    console.log(user);
    return this.activityService.createActivity({
      data,
      userId: user.id,
    });
  }
}