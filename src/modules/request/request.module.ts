import { Module } from '@nestjs/common';
import { RequestController } from './request.controller';
import { RequestService } from './request.service';
import { PaymentService } from '../payment/payment.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [RequestController],
  providers: [RequestService,PaymentService,PrismaService]
})
export class RequestModule {}
