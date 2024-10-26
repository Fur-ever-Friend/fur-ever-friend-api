import { IsNotEmpty, IsNumber, IsString, IsUUID } from 'class-validator';

export class PaymentInfoDto {
  @IsNotEmpty()
  @IsUUID('4')
  activityId: string;
}