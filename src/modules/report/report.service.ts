import { Injectable, NotFoundException, UseGuards } from '@nestjs/common';
import { CreateReportDto } from './dto/create-report.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Role } from '@prisma/client';
import { UserService } from '../user/user.service';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';

@Injectable()
export class ReportService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly userService: UserService,
  ) { }
  async create(createReportDto: CreateReportDto, reportImages: string[]) {
    const reporterId = createReportDto.reporterId;
    const reportedId = createReportDto.reportedId;

    const reporter = this.userService.getUserById(reporterId);
    const reported = this.userService.getUserById(reportedId);
    if (!reporter || !reported) {
      throw new NotFoundException('Reporter or reported user not found');
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
      }
    });

    return report;
  }

  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  findAll() {
    return this.prismaService.report.findMany({
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
      }
    });
  }

  findOne(id: string) {
    return this.prismaService.report.findUnique({
      where: { id },
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
      },
    });
  }

}
