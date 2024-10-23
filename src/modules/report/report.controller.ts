import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  HttpStatus,
  Query
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidV4 } from 'uuid';
import { Role } from '@prisma/client';

import { ReportService } from './report.service';
import { ReportQueryDto, CreateReportSchema } from './dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { checkFileNameEncoding, generateRandomFileName, handleError } from 'src/common/utils';

@Controller('reports')
export class ReportController {
  constructor(
    private readonly reportService: ReportService,
  ) { }

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FilesInterceptor('reportImages', 5, {
      storage: diskStorage({
        destination: './uploads',
        filename: (_, file, callback) => {
          const [originalFilename, fileExt] = file.originalname.split('.');
          const extension = file.mimetype.split("/")[1];
          const id = uuidV4();
          let filename: string;
          if (!checkFileNameEncoding(originalFilename))
            filename = `${id}-${generateRandomFileName()}.${extension}`;
          else
            filename = `${originalFilename}-${id}.${fileExt}`;
          callback(null, filename);
        },
      }),
      limits: { fileSize: 10 * 1024 * 1024 },
      fileFilter(_, file, callback) {
        const validExtensions = /\.(jpg|jpeg|png)$/;
        if (!file.originalname.match(validExtensions)) {
          return callback(null, false);
        }
        callback(null, true);
      },
    }),
  )
  @HttpCode(HttpStatus.CREATED)
  async create(@Body('json') jsonStr: string, @UploadedFiles() files: Express.Multer.File[]) {
    try {
      const jsonParsed = JSON.parse(jsonStr);
      const createReportDto = CreateReportSchema.parse(jsonParsed);
      const reportImages = files.map((file) => file.filename);
      const response = await this.reportService.create(createReportDto, reportImages);
      return {
        statusCode: HttpStatus.CREATED,
        message: "Report created successfully.",
        data: response,
      }
    } catch (err: unknown) {
      handleError(err, "ReportController.create");
    }
  }

  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  async findAll(@Query() reportQueryDto: ReportQueryDto) {
    const result = await this.reportService.findAll(reportQueryDto);
    return {
      statusCode: HttpStatus.OK,
      message: "Reports retrieved successfully.",
      data: result,
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const result = await this.reportService.findOne(id);
    return {
      statusCode: HttpStatus.OK,
      message: "Report retrieved successfully.",
      data: result,
    }
  }

}
