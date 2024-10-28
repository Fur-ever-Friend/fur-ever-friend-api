import { Module } from '@nestjs/common';
import { ReportService } from './report.service';
import { ReportController } from './report.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { UserModule } from '../user/user.module';
import { ActivityModule } from '../activity/activity.module';

@Module({
  imports: [PrismaModule, UserModule, ActivityModule],
  controllers: [ReportController],
  providers: [ReportService],
})
export class ReportModule { }
