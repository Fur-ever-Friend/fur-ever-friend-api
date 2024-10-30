import { BadRequestException, Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { QualificationService } from './qualification.service';
import { QualificationDto, QualificationSchema, UpdateQualificationStateDto } from './dto/qualification.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidV4 } from "uuid";
import { checkFileNameEncoding, generateRandomFileName } from '@/common/utils/check-filename-encoding';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';

@Controller('qualifications')
export class QualificationController {
  constructor(private readonly qualificationService: QualificationService) { }

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (_, file, callback) => {
          const [originalFilename, fileExt] = file.originalname.split('.');
          const extension = file.mimetype.split("/")[1];
          const id = uuidV4();
          let filename: string;
          if (!checkFileNameEncoding(originalFilename)) filename = `${generateRandomFileName()}-${id}.${extension}`;
          else filename = `${originalFilename}-${id}.${fileExt}`;
          callback(null, filename);
        },
      }),
      limits: { fileSize: 10 * 1024 * 1024 },
      fileFilter(_, file, callback) {
        const validExtensions = /\.(jpg|jpeg|png|pdf)$/;
        if (!file.originalname.match(validExtensions)) {
          return callback(null, false);
        }
        callback(null, true);
      },
    }
    ))
  async create(@Body("json") json: string, @UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException("No file attached")
    const jsonParse = JSON.parse(json);
    const validateData = QualificationSchema.safeParse(jsonParse);
    if (!validateData.success) {
      throw new BadRequestException("Invalid Field");
    }
    const data = validateData.data as QualificationDto;
    const response = await this.qualificationService.create(data, file);
    return {
      statusCode: HttpStatus.CREATED,
      message: "Qualification created successfully",
      data: response
    }
  }

  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  async getQualifications() {
    const response = await this.qualificationService.getQualifications();
    return {
      statusCode: HttpStatus.OK,
      message: "Qualifications retrieved successfully",
      data: response
    }
  }

  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put(':id')
  async updateQualification(@Param('id') id: string, @Body() updateQualificationStateDto: UpdateQualificationStateDto) {
    await this.qualificationService.updateQualification(id, updateQualificationStateDto.state);
    return {
      statusCode: HttpStatus.OK,
      message: "Qualification updated successfully",
    }
  }

  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':id')
  async getQualification(@Param('id') id: string) {
    const response = await this.qualificationService.getQualificationById(id);
    return {
      statusCode: HttpStatus.OK,
      message: "Qualification retrieved successfully",
      data: response
    }
  }

  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  async deleteQualification(@Param('id') id: string) {
    await this.qualificationService.deleteQualification(id);
    return {
      statusCode: HttpStatus.OK,
      message: "Qualification deleted successfully",
    }
  }
}
