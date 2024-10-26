import { IsUUID } from 'class-validator';

export class PaymentInfoDto {
  @IsUUID('4', { message: 'Activity ID must be a valid UUID' })
  activityId: string;
}