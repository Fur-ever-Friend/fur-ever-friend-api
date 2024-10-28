import { IsNotEmpty, IsString, IsInt, Min, Max } from 'class-validator';

export class CreateReviewDto {
  @IsString({ message: 'Activity ID must be a string' })
  @IsNotEmpty({ message: 'Activity ID should not be empty' })
  activityId: string;

  @IsString({ message: 'Petsitter ID must be a string' })
  @IsNotEmpty({ message: 'Petsitter ID should not be empty' })
  petsitterId: string;

  @IsString({ message: 'Content must be a string' })
  @IsNotEmpty({ message: 'Content should not be empty' })
  content: string;

  @IsInt({ message: 'Rating must be an integer' })
  @Min(1, { message: 'Rating must be at least 1' })
  @Max(5, { message: 'Rating must be at most 5' })
  rating: number;
}
