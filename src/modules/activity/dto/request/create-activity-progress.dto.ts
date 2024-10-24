import { IsNotEmpty, IsString } from 'class-validator';

export class CreateActivityProgressDto {
  @IsNotEmpty()
  @IsString()
  activityServiceId: string;

  @IsNotEmpty()
  @IsString()
  content: string;
}