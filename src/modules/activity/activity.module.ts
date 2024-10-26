import { Module } from '@nestjs/common';
import { ActivityController } from './activity.controller';
import { ActivityService } from './activity.service';
import { PrismaService } from '../prisma/prisma.service';
import { AnimalTypeModule } from '../animal-type/animal-type.module';

@Module({
  imports: [AnimalTypeModule],
  controllers: [ActivityController],
  providers: [ActivityService, PrismaService],
  exports: [ActivityService],
})
export class ActivityModule {}
