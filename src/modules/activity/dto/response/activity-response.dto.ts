import { ApiProperty } from '@nestjs/swagger';
import { Activity } from '@prisma/client';

export class ActivityResponseDto {

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: 'Morning Run' })
  name: string;

  @ApiProperty({ example: 'A quick run in the park' })
  detail: string;

  @ApiProperty({ example: '2023-10-01T08:00:00Z' })
  startDateTime: Date;

  @ApiProperty({ example: '2023-10-01T09:00:00Z' })
  endDateTime: Date;

  @ApiProperty({ example: 'Central Park' })
  pickupPoint: string;

  @ApiProperty({ example: 20 })
  price: number;

  @ApiProperty({ example: 'ASSIGNED' })
  state: string;

  static selectFields() {
    return {
      id: true,
      name: true,
      detail: true,
      startDateTime: true,
      endDateTime: true,
      pickupPoint: true,
      price: true,
      state: true,
    };
  }

  static formatActivityResponse(activity: Activity): ActivityResponseDto {
    return {
      id: activity.id,
      name: activity.name,
      detail: activity.detail,
      startDateTime: activity.startDateTime,
      endDateTime: activity.endDateTime,
      pickupPoint: activity.pickupPoint,
      price: activity.price,
      state: activity.state,
    };
  }
}