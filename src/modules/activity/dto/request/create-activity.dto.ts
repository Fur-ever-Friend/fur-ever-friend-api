import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsDateString, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ServiceType } from '@prisma/client';

class CreateServiceDto {
  @ApiProperty({ example: "Walking service for pet 1" })
  @IsString()
  @IsNotEmpty()
  detail: string;

  @ApiProperty({ example: "PET_WALKING" })
  @IsString()
  @IsNotEmpty()
  serviceType: ServiceType;

  @ApiProperty({ example: "pet-id-1" })
  @IsString()
  @IsNotEmpty()
  petId: string;
}

export class CreateActivityDto {
  @ApiProperty({ example: "Morning Walk" })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: "A morning walk in the park" })
  @IsString()
  @IsNotEmpty()
  detail: string;

  @ApiProperty({ example: "2023-10-01T08:00:00Z" })
  @IsDateString()
  startDateTime: Date;

  @ApiProperty({ example: "2023-10-01T09:00:00Z" })
  @IsDateString()
  endDateTime: Date;

  @ApiProperty({ example: "Central Park" })
  @IsString()
  @IsNotEmpty()
  pickupPoint: string;

  @ApiProperty({ type: [CreateServiceDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateServiceDto)
  services: CreateServiceDto[];
}