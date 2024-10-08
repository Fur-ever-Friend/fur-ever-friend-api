import { BadRequestException, Body, Controller, Get, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { QualificationService } from './qualification.service';
import { QualificationDto, QualificationSchema } from './dto/qualification.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidV4 } from "uuid";
import { checkFileNameEncoding, generateRandomFileName } from 'src/common/utils/checkFilenameEncoding';

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
          if (!checkFileNameEncoding(originalFilename)) filename = `${id}-${generateRandomFileName()}.${extension}`;
          else filename = `${id}-${originalFilename}.${fileExt}`;
          callback(null, filename);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter(_, file, callback) {
        const validExtensions = /\.(jpg|jpeg|png|gif)$/;
        if (!file.originalname.match(validExtensions)) {
          return callback(null, false);
        }
        callback(null, true);
      },
    }
    ))
  create(@Body("json") json: string, @UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException("No file attached")
    try {
      const jsonParse = JSON.parse(json);
      const validateData = QualificationSchema.safeParse(jsonParse);
      if (!validateData.success) {
        throw new BadRequestException("Invalid Field");
      }
      const data = validateData.data as QualificationDto;
      return this.qualificationService.save(data, file);
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException("Invalid JSON");
    }
  }

  @Get()
  getQualifications() {
    return this.qualificationService.getQualifications();
  }
}


