import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Role, User } from '@prisma/client';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidV4 } from 'uuid';

import { ActivityService } from './activity.service';
import {
  CreateReviewDto,
  CreateActivityDto,
  CreateProgressSchema,
  CreateProgressDto,
  UpdateActivityStateDto,
} from './dto';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { checkFileNameEncoding, generateRandomFileName } from '@/common/utils';
import { Id } from '@/common/global-dtos/id-query.dto';
import { ActivityQueryDto } from './dto/request/activity-query.dto';
import { ActivityPetsitterQueryDto } from './dto/request/activity-petsitter-query.dto';
import { InvitePetsitterDto } from './dto/request/invite-petsitter.dto';

@ApiTags('activities')
@ApiBearerAuth()
@Controller('activities')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ActivityController {
  constructor(private readonly activityService: ActivityService) { }

  @Roles(Role.ADMIN, Role.PETSITTER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  async getActivities(@Query() activityQueryDto: ActivityQueryDto, @CurrentUser() user: User) {
    const result = await this.activityService.getActivities(activityQueryDto, user.role === Role.ADMIN);
    return {
      statusCode: HttpStatus.OK,
      message: "Activities retrieved successfully.",
      data: result,
    }
  }

  @Get('me')
  @Roles(Role.CUSTOMER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getYourActivities(@CurrentUser() user: User) {
    const result = await this.activityService.getYourActivities(user["customer"]["id"]);
    return {
      statusCode: HttpStatus.OK,
      message: "Your activities retrieved successfully.",
      data: result,
    }
  }

  @Roles(Role.PETSITTER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('petsitter')
  async getActivitiesByPetsitter(@Query() activityPetsitterQueryDto: ActivityPetsitterQueryDto, @CurrentUser() user: User) {
    const result = await this.activityService.getActivitiesByPetsitter(user["petsitter"]["id"], activityPetsitterQueryDto);
    return {
      statusCode: HttpStatus.OK,
      message: "Activities retrieved successfully.",
      data: result,
    }
  }

  @Roles(Role.ADMIN, Role.PETSITTER, Role.CUSTOMER)
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getActivityById(@Param() { id }: Id) {
    const result = await this.activityService.getActivityById(id);
    return {
      statusCode: HttpStatus.OK,
      message: "Activity retrieved successfully.",
      data: result,
    }
  }

  @Roles(Role.CUSTOMER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createActivity(@CurrentUser() user: User, @Body() data: CreateActivityDto) {
    const result = await this.activityService.createActivity(data, user["customer"]["id"]);
    return {
      statusCode: HttpStatus.CREATED,
      message: "Activity created successfully.",
      data: result,
    }
  }

  @Roles(Role.PETSITTER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post(':id/progress')
  @UseInterceptors(
    FilesInterceptor('progresses', 5, {
      storage: diskStorage({
        destination: './uploads',
        filename: (_, file, callback) => {
          const [originalFilename, fileExt] = file.originalname.split('.');
          const extension = file.mimetype.split('/')[1];
          const id = uuidV4();
          let filename: string;

          if (!checkFileNameEncoding(originalFilename)) {
            filename = `${generateRandomFileName()}-${id}.${extension}`;
          } else {
            filename = `${originalFilename}-${id}.${fileExt}`;
          }

          callback(null, filename);
        },
      }),
      limits: { fileSize: 10 * 1024 * 1024 },
      fileFilter(_, file, callback) {
        const validExtensions = /\.(jpg|jpeg|png)$/;
        if (!file.originalname.match(validExtensions)) {
          return callback(null, false);
        }
        callback(null, true);
      },
    }),
  )
  @HttpCode(HttpStatus.CREATED)
  async createProgress(
    @Param() { id }: Id,
    @CurrentUser() user: User,
    @Body('json') progress: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const jsonParse = JSON.parse(progress);
    const progressData = CreateProgressSchema.parse(jsonParse) satisfies CreateProgressDto;
    console.log("progressData", progressData);
    const progressImages = files.map(file => file.filename) ?? [];
    const result = await this.activityService.createProgress(id, user["petsitter"]["id"], progressData, progressImages);

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Activity progress created successfully.',
      data: result,
    };
  }

  @Roles(Role.CUSTOMER, Role.PETSITTER, Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':id/progress')
  async getProgressesByActivityId(@Param() { id }: Id, @CurrentUser() user: User) {
    const result = await this.activityService.getProgressesByActivityId(id, user);
    return {
      statusCode: HttpStatus.OK,
      message: "Activity progresses retrieved successfully.",
      data: result,
    }
  }

  @Roles(Role.CUSTOMER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put(':id') // PUT /activities/:id
  async updateActivityState(@Param('id') { id }: Id, @Body() { state }: UpdateActivityStateDto, @CurrentUser() user: User) {
    const result = await this.activityService.updateActivityState(id, state);
    return {
      statusCode: HttpStatus.OK,
      message: "Activity state updated successfully.",
      data: result,
    }
  }

  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete()
  async deleteAllActivity() {
    await this.activityService.deleteAllActivities();
    return {
      statusCode: HttpStatus.OK,
      message: "All activities deleted successfully.",
    }
  }

  @Roles(Role.PETSITTER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('review')
  @HttpCode(HttpStatus.CREATED)
  async createReview(@CurrentUser() user: User, @Body() data: CreateReviewDto) {
    const result = await this.activityService.createReview(data, user["petsitter"]["id"]);
    return {
      statusCode: HttpStatus.CREATED,
      message: "Review created successfully.",
      data: result,
    }
  }

  @Roles(Role.ADMIN, Role.CUSTOMER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':id/review')
  async getReviewByActivityId(@Param() { id }: Id) {
    const result = await this.activityService.getReviewByActivityId(id);
    return {
      statusCode: HttpStatus.OK,
      message: "Review retrieved successfully.",
      data: result,
    }
  }

  @Roles(Role.CUSTOMER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post(':id/invite')
  @HttpCode(HttpStatus.CREATED)
  async invitePetsitter(@Param() { id }: Id, @CurrentUser() user: User, @Body() { petsitterId }: InvitePetsitterDto) {
    const result = await this.activityService.invitePetsitter(id, user["customer"]["id"], petsitterId);
    return {
      statusCode: HttpStatus.CREATED,
      message: "Petsitter invited successfully.",
      data: result,
    }
  }

}
