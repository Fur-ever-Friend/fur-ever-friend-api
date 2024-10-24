import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags, ApiOkResponse } from '@nestjs/swagger';
import { ActivityService } from './activity.service';
import { ActivityResponseDto } from './dto';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { CreateActivityDto } from './dto/request/create-activity.dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';

import { Activity, ActivityProgress, Role, User } from '@prisma/client';
import { Roles } from '@/common/decorators/roles.decorator';
import { checkFileNameEncoding, generateRandomFileName } from '@/common/utils';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { CreateActivityProgressDto } from './dto/create-activity-progress.dto';
import { v4 as uuidV4 } from 'uuid';

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

  @ApiOperation({ summary: 'Create activity progress' })
  @ApiOkResponse({ status: 201 })
  @Post('progress')
  @Roles(Role.PETSITTER)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (_, file, callback) => {
          const [originalFilename, fileExt] = file.originalname.split('.');
          const extension = file.mimetype.split('/')[1];
          const id = uuidV4();
          let filename: string;
          if (!checkFileNameEncoding(originalFilename))
            filename = `${id}-${generateRandomFileName()}.${extension}`;
          else filename = `${id}-${originalFilename}.${fileExt}`;
          callback(null, filename);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter(_, file, callback) {
        const validExtensions = /\.(jpg|jpeg|png|gif)$/;
        if (!file.originalname.match(validExtensions)) {
          return callback(null, false);
        }
        callback(null, true);
      },
    }),
  )
  async createActivityProgress(
    @CurrentUser() user: User,
    @Body() data: CreateActivityProgressDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ActivityProgress> {
    return this.activityService.createActivityProgress(data, file, user.id);
  }

  @ApiOperation({ summary: 'Get activity progress' })
  @ApiOkResponse({ status: 200 })
  @Get('progress')
  @Roles(Role.CUSTOMER, Role.PETSITTER)
  async getActivityProgress(@CurrentUser() user: User): Promise<ActivityProgress[]> {
    return this.activityService.getActivityProgress(user.id);
  }
}
