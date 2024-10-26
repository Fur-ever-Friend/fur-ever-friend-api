import { Module } from '@nestjs/common';
import { AnimalTypeController } from './animal-type.controller';
import { AnimalTypeService } from './animal-type.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AnimalTypeController],
  providers: [AnimalTypeService],
  exports: [AnimalTypeService],
})
export class AnimalTypeModule {}
