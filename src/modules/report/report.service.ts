import { BadRequestException, Injectable, NotFoundException, UseGuards } from '@nestjs/common';
import { ActivityState, Prisma, Role } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { UserService } from '../user/user.service';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { CreateReportDto, ReportQueryDto } from './dto';
import { ActivityService } from '../activity/activity.service';

@Injectable()
export class ReportService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly userService: UserService,
    private readonly activityService: ActivityService,
  ) { }

  async create(createReportDto: CreateReportDto, reportImages: string[]) {
    const reporterId = createReportDto.reporterId;
    const reportedId = createReportDto.reportedId;

    if (reporterId === reportedId) {
      throw new BadRequestException('Reporter and reported user cannot be the same');
    }

    const reporter = await this.userService.getUserByIdWithoutCredential(reporterId);
    const reported = await this.userService.getUserByIdWithoutCredential(reportedId);
    if (!reporter || !reported) {
      throw new NotFoundException('Reporter or reported user not found');
    }

    // if (reporter.role === Role.CUSTOMER) {
    //   await this.activityService.updateActivityState(createReportDto.activityId, ActivityState.FAILED);
    // }

    const activity = await this.activityService.getActivityById(createReportDto.activityId);
    if (!activity) {
      throw new NotFoundException('Activity not found');
    }

    console.log(activity.state);
    if (activity.state !== ActivityState.COMPLETED && activity.state !== ActivityState.FAILED) {
      throw new BadRequestException('Activity must be completed or failed to report');
    }

    const report = await this.prismaService.report.create({
      data: {
        ...createReportDto,
        reportImages,
      } as Prisma.ReportCreateInput,
      select: {
        id: true,
        type: true,
        content: true,
        reportImages: true,
        reporter: {
          select: {
            id: true,
            email: true,
            role: true,
            firstname: true,
            lastname: true,
            avatar: true,
          }
        },
        reported: {
          select: {
            id: true,
            email: true,
            role: true,
            firstname: true,
            lastname: true,
            avatar: true,
          }
        },
        createdAt: true,
      }
    });

    return report;
  }

  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async findAll(reportQueryDto: ReportQueryDto) {
    const { type, startDate, endDate, page = 1, limit = 10 } = reportQueryDto;
    const where: Prisma.ReportWhereInput = {};
    if (type) where.type = type;
    if (startDate && endDate) where.createdAt = { gte: startDate, lte: endDate };
    console.log(where);
    console.log(reportQueryDto);
    const reports = await this.prismaService.report.findMany({
      where,
      take: limit,
      skip: (page - 1) * limit,
      select: {
        id: true,
        type: true,
        content: true,
        reportImages: true,
        createdAt: true,
        reporter: {
          select: {
            id: true,
            email: true,
            role: true,
            firstname: true,
            lastname: true,
            avatar: true,
          }
        },
        reported: {
          select: {
            id: true,
            email: true,
            role: true,
            firstname: true,
            lastname: true,
            avatar: true,
          }
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const total = await this.prismaService.report.count({ where });

    return {
      reports,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    }
  }

  findOne(id: string) {
    return this.prismaService.report.findUniqueOrThrow({
      where: { id },
      select: {
        id: true,
        type: true,
        content: true,
        reportImages: true,
        createdAt: true,
        reporter: {
          select: {
            id: true,
            email: true,
            role: true,
            firstname: true,
            lastname: true,
            avatar: true,
          }
        },
        reported: {
          select: {
            id: true,
            email: true,
            role: true,
            firstname: true,
            lastname: true,
            avatar: true,
          }
        },
      },
    });
  }
}
