import { Controller, Get, Post, Body, Param, HttpCode, UseGuards, UseInterceptors, UploadedFiles, HttpStatus, BadRequestException, HttpException } from '@nestjs/common';
import { ReportService } from './report.service';
import { CreateReportSchema } from './dto/create-report.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { FilesInterceptor } from '@nestjs/platform-express';
import { checkFileNameEncoding, generateRandomFileName, handleError } from 'src/common/utils';
import { diskStorage } from 'multer';
import { v4 as uuidV4 } from 'uuid';

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
  @HttpCode(201)
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
  findAll() {
    return this.reportService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reportService.findOne(id);
  }

}
