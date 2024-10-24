import { Module } from '@nestjs/common';
import { PetSitterController } from './pet-sitter.controller';
import { PetSitterService } from './pet-sitter.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [PetSitterController],
  providers: [PetSitterService, PrismaService],
  exports: [PetSitterService],
})
export class PetSitterModule {}
