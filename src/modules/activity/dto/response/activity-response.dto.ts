import { ApiProperty } from '@nestjs/swagger';
import { ActivityService, Activity, ActivityState, ServiceType } from '@prisma/client';

export class ActivityServiceDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  detail: string;

  @ApiProperty()
  serviceType: ServiceType;

  @ApiProperty()
  petId: string;
}

export class ActivityResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  detail: string;

  @ApiProperty()
  startDateTime: Date;

  @ApiProperty()
  endDateTime: Date;

  @ApiProperty()
  pickupPoint: string;

  @ApiProperty({ example: 20 })
  price: number;

  @ApiProperty({ example: 'ASSIGNED' })
  state: ActivityState;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  customerId: string;

  @ApiProperty()
  petsitterId: string | null;

  @ApiProperty({ type: [ActivityServiceDto] })
  services: ActivityServiceDto[];

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
      createdAt: true,
      updatedAt: true,
      customerId: true,
      petsitterId: true,
      services: {
        select: {
          id: true,
          detail: true,
          serviceType: true,
          petId: true,
        },
      },
    };
  }

  static formatActivityResponse(activity: Activity & { services: ActivityService[] }): ActivityResponseDto {
    return {
      id: activity.id,
      name: activity.name,
      detail: activity.detail,
      startDateTime: activity.startDateTime,
      endDateTime: activity.endDateTime,
      pickupPoint: activity.pickupPoint,
      price: activity.price,
      state: activity.state,
      createdAt: activity.createdAt,
      updatedAt: activity.updatedAt,
      customerId: activity.customerId,
      petsitterId: activity.petsitterId,
      services: activity.services.map(service => ({
        id: service.id,
        detail: service.detail,
        serviceType: service.serviceType,
        petId: service.petId,
      })),
    };
  }
}