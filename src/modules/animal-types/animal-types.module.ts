import { Module } from '@nestjs/common';
import { AnimalTypeController } from './animal-types.controller';
import { AnimalTypeService } from './animal-types.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AnimalTypeController],
  providers: [AnimalTypeService],
  exports: [AnimalTypeService],
})
export class AnimalTypeModule {}
