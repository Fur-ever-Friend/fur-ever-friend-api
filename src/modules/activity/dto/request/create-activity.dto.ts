import { IsArray, IsDateString, IsEnum, IsNotEmpty, IsString, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ServiceType } from '@prisma/client';

class CreateServiceDto {
  @IsUUID('4')
  petId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTaskDto)
  tasks: CreateTaskDto[];
}

export class CreateTaskDto {
  @IsEnum(ServiceType)
  type: ServiceType;

  @IsString()
  @IsNotEmpty()
  detail: string;
}

export class CreateActivityDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  detail: string;

  @IsDateString()
  startDateTime: Date;

  @IsDateString()
  endDateTime: Date;

  @IsString()
  @IsNotEmpty()
  pickupPoint: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateServiceDto)
  services: CreateServiceDto[];
}
