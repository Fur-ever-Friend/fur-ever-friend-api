import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateReportDto } from './dto/create-report.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { UserService } from '../user/user.service';

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
      } as any,
    });

    console.log('report', report);

    return report;
  }

  findAll() {
    return this.prismaService.report.findMany({
      include: {
        reporter: true,
        reported: true,
      },
    });
  }

  findOne(id: string) {
    return this.prismaService.report.findUnique({
      where: { id },
      include: {
        reporter: true,
        reported: true,
      },
    });
  }

}
