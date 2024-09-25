import { Module } from '@nestjs/common';
import { QualificationService } from './qualification.service';
import { QualificationController } from './qualification.controller';
import { PrismaModule } from 'src/modules/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [QualificationController],
  providers: [QualificationService],
  exports: [QualificationService],
})
export class QualificationModule { }
