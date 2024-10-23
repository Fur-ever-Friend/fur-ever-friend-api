import { ApiProperty } from '@nestjs/swagger';
import { ServiceType } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsString, IsDate, IsNotEmpty, IsUUID, IsArray, ValidateNested, IsEnum } from 'class-validator';

class CreateActivityServiceDto {
  @ApiProperty({
    example: 'Detailed grooming service',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  detail: string;

  @ApiProperty({
    example: 'PET_GROOMING',
    required: true,
  })
  @IsEnum(ServiceType)
  @IsNotEmpty()
  serviceType: ServiceType;

  petId: string;
}

export class CreateActivityDto {
  @ApiProperty({
    example: "Morning Run",
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: "A quick run in the park",
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  detail: string;

  @ApiProperty({
    example: "2023-10-01T08:00:00Z",
    required: true,
  })
  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  startDateTime: Date;

  @ApiProperty({
    example: "2023-10-01T09:00:00Z",
    required: true,
  })
  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  endDateTime: Date;

  @ApiProperty({
    example: "Central Park",
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  pickupPoint: string;


  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: true,
  })
  @IsUUID()
  @IsNotEmpty()
  petId: string;

  @ApiProperty({
    type: [CreateActivityServiceDto],
    required: true,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateActivityServiceDto)
  services: CreateActivityServiceDto[];
}