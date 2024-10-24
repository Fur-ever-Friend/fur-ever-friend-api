import { Injectable } from '@nestjs/common';

@Injectable()
export class PaymentService {
  async processPayment(paymentInfo: any): Promise<{ success: boolean; transactionId?: string }> {
    // Mock payment processing logic
    const success = Math.random() > 0.2; // Simulate a 80% success rate
    const transactionId = success ? 'txn_1234567890' : undefined;

    return { success, transactionId };
  }
}