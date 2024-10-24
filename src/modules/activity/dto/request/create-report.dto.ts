import { IsNotEmpty, IsString, IsEnum } from 'class-validator';
import { ReportType } from '@prisma/client';

export class CreateReportDto {
  @IsNotEmpty()
  @IsString()
  reportedId: string;

  @IsNotEmpty()
  @IsEnum(ReportType)
  type: ReportType;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsNotEmpty()
  @IsString()
  body: string;

  @IsNotEmpty()
  @IsString()
  url: string;
}