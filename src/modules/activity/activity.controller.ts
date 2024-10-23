import { Body, Controller, Get, Logger, Param, Post, UseGuards } from '@nestjs/common';
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

import { Role, User } from '@prisma/client';
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
  async getYourActivities(@CurrentUser() user: User): Promise<ActivityResponseDto[]> {
    return this.activityService.getYourActivities(user.id);
  }

  @ApiOperation({ summary: 'Get activities by id' })
  @ApiOkResponse({ status: 200 })
  @Get(':id')
  async getActivityById(@Param('id') id: string): Promise<ActivityResponseDto> {
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
}
