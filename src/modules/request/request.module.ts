import { Module } from '@nestjs/common';
import { RequestController } from './request.controller';
import { RequestService } from './request.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ActivityModule } from '../activity/activity.module';
import { PaymentModule } from '../payment/payment.module';

@Module({
  imports: [PrismaModule, ActivityModule, PaymentModule],
  controllers: [RequestController],
  providers: [RequestService]
})
export class RequestModule {}
