import { Body, Controller, Get, Logger, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ActivityService } from './activity.service';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { CreateActivityDto } from './dto/create-activity.dto';

import { User } from '@prisma/client';

@ApiTags('activities')
@ApiBearerAuth()
@Controller('activities')
@UseGuards(JwtAuthGuard)
export class ActivityController {
  private readonly logger = new Logger(ActivityController.name);
  constructor(private readonly activityService: ActivityService) {}

  @ApiOperation({ summary: 'Get all activities' })
  @ApiResponse({ status: 200 })
  @Get()
  async getAllActivities() {
    return this.activityService.getActivities();
  }

  @ApiOperation({ summary: 'Get activities by id' })
  @Get(':id')
  async getActivityById(@Param('id') id: string) {
    return this.activityService.getActivityById(id);
  }

  @ApiBody({ type: CreateActivityDto })
  @ApiOperation({ summary: 'Create activity' })
  @ApiResponse({ status: 201 })
  @Post()
  async createActivity(@CurrentUser() user: User, @Body() data: CreateActivityDto) {
    return this.activityService.createActivity(data, user.id);
  }
}
