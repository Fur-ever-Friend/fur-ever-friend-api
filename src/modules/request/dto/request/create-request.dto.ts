import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, MinLength, MaxLength, IsPositive, Max, Min, IsUUID } from 'class-validator';

export class CreateRequestDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: true,
  })
  @IsUUID('4', { message: 'Activity ID must be a valid UUID' })
  activityId: string;

  @ApiProperty({
    example: '20',
    required: true,
  })
  @IsNumber({}, { message: 'Price must be a number' })
  @IsPositive({ message: 'Price must be a positive number' })
  @Min(20, { message: 'Price must be at least 20$' })
  @Max(500, { message: 'Price must be at most 500$' })
  price: number;

  @ApiProperty({
    example: 'I would like to do this activity',
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'Message is required' })
  message: string;
}