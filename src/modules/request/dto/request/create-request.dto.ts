import { IsString, IsNotEmpty, IsNumber, MinLength, MaxLength, IsPositive, Max, Min, IsUUID } from 'class-validator';

export class CreateRequestDto {
  @IsUUID('4', { message: 'Activity ID must be a valid UUID' })
  activityId: string;

  @IsNumber({}, { message: 'Price must be a number' })
  @IsPositive({ message: 'Price must be a positive number' })
  @Min(20, { message: 'Price must be at least 20$' })
  @Max(500, { message: 'Price must be at most 500$' })
  price: number;

  @IsString()
  @IsNotEmpty({ message: 'Message is required' })
  message: string;
}