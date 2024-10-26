import { Module } from '@nestjs/common';
import { BreedController } from './breed.controller';
import { BreedService } from './breed.service';
import { PrismaModule } from 'src/modules/prisma/prisma.module';
import { AnimalTypeModule } from '../animal-type/animal-type.module';

@Module({
  imports: [PrismaModule, AnimalTypeModule],
  controllers: [BreedController],
  providers: [BreedService],
  exports: [BreedService],
})
export class BreedModule {}
