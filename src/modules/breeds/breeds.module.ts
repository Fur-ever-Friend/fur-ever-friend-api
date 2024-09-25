import { Module } from '@nestjs/common';
import { BreedController } from './breeds.controller';
import { BreedService } from './breeds.service';
import { PrismaModule } from 'src/modules/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [BreedController],
  providers: [BreedService],
  exports: [BreedService],
})
export class BreedModule {}
