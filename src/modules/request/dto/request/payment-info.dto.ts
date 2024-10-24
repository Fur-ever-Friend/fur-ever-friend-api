import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class PaymentInfoDto {
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  @IsString()
  transactionId: string;
}