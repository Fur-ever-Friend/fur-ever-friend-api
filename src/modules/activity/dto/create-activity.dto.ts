import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, IsDate, IsNumber, IsNotEmpty } from 'class-validator';

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
    example: 14,
    required: true,
  })
  @IsNumber()
  @IsNotEmpty()
  price: number;
}