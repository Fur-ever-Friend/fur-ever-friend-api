import { Module } from '@nestjs/common';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { UserModule } from '../user/user.module';
import { ActivityModule } from '../activity/activity.module';

@Module({
  imports: [PrismaModule, UserModule, ActivityModule],
  controllers: [ReviewController],
  providers: [ReviewService],
})
export class ReviewModule { }
