import { BadRequestException, Body, Controller, Get, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { QualificationService } from './qualification.service';
import { QualificationDto } from './dto/qualification.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidV4 } from "uuid";
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
          const id = uuidV4();
          const fileName = `${id}-${originalFilename}.${fileExt}`;
          callback(null, fileName);
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
  create(@Body() qualificationDto: QualificationDto, @UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException("No file attached")
    return this.qualificationService.save(qualificationDto, file);
  }

  @Get()
  getQualifications() {
    return this.qualificationService.getQualifications();
  }
}


