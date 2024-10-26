import { ApiProperty } from '@nestjs/swagger';
import { PetsitterRequest, State } from '@prisma/client';

export class GetRequestResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ enum: State })
  state: State;

  @ApiProperty()
  price?: number;

  @ApiProperty()
  message?: string;

  @ApiProperty()
  activityId: string;

  @ApiProperty()
  activityName: string;

  @ApiProperty()
  activityStartDateTime: Date;

  @ApiProperty()
  activityEndDateTime: Date;

  static formatRequestResponse(request: any): GetRequestResponseDto {
    return {
      id: request.id,
      createdAt: request.createdAt,
      state: request.state,
      price: request.price,
      message: request.message,
      activityId: request.activityId,
      activityName: request.activity.name,
      activityStartDateTime: request.activity.startDateTime,
      activityEndDateTime: request.activity.endDateTime,
    };
  }
}
