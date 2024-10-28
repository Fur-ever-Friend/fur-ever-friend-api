import { IsArray, IsDateString, IsEnum, IsNotEmpty, IsString, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ServiceType } from '@prisma/client';

class CreateTaskDto {
  @IsEnum(ServiceType, { message: 'Type must be a valid service type' })
  type: ServiceType;

  @IsString({ message: 'Detail must be a string' })
  @IsNotEmpty({ message: 'Detail should not be empty' })
  detail: string;
}

class CreateServiceDto {
  @IsUUID('4', { message: 'Invalid petId: must be a valid UUID' })
  petId: string;

  @IsArray({ message: 'Tasks must be an array' })
  @ValidateNested({ each: true, message: 'Each task must be a valid task' })
  @Type(() => CreateTaskDto)
  tasks: CreateTaskDto[];
}

export class CreateActivityDto {
  @IsString({ message: 'Title must be a string' })
  @IsNotEmpty({ message: 'Title should not be empty' })
  title: string;

  @IsString({ message: 'Detail must be a string' })
  @IsNotEmpty({ message: 'Detail should not be empty' })
  detail: string;

  @IsDateString({}, { message: 'Start date and time must be a valid date string' })
  startDateTime: Date;

  @IsDateString({}, { message: 'End date and time must be a valid date string' })
  endDateTime: Date;

  @IsString({ message: 'Pickup point must be a string' })
  @IsNotEmpty({ message: 'Pickup point should not be empty' })
  pickupPoint: string;

  @IsArray({ message: 'Services must be an array' })
  @ValidateNested({ each: true, message: 'Each service must be valid' })
  @Type(() => CreateServiceDto)
  services: CreateServiceDto[];
}
