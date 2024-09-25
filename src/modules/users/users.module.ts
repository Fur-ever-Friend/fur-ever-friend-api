import { Module } from '@nestjs/common';
import { UserController } from './users.controller';
import { UserService } from './users.service';
import { PrismaModule } from '../prisma/prisma.module';
import { QualificationModule } from 'src/modules/qualification/qualification.module';

@Module({
  imports: [PrismaModule, QualificationModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule { }
