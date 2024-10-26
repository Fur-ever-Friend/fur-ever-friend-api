import { BadRequestException, Injectable } from '@nestjs/common';
import { v4 as uuidV4 } from 'uuid';
import { PaymentInfoDto } from '../request/dto';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentState } from '@prisma/client';
import { CreatePaymentDto } from './dto/PaymentInfoDto.dto';
@Injectable()
export class PaymentService {
  constructor(private readonly prismaService: PrismaService) { }
  processPayment() {
    // Mock payment processing logic
    const success = Math.random() > 0.2; // Simulate a 80% success rate

    const transactionId = success ? uuidV4() : undefined;
    return { success, transactionId };
  }

  async createPayment(paymentInfo: CreatePaymentDto) {
    const { success, transactionId } = this.processPayment();
    const state = success ? PaymentState.SUCCEEDED : PaymentState.FAILED;

    const payment = await this.prismaService.payment.create({
      data: {
        amount: paymentInfo.amount,
        transactionId: transactionId,
        state: state,
        activityId: paymentInfo.activityId,
      },
      select: {
        id: true,
        amount: true,
        transactionId: true,
        state: true,
        activityId: true,
      }
    });

    if (!success) {
      throw new BadRequestException('Payment failed');
    }

    return payment;
  }

}