import { Module } from '@nestjs/common';
import { PetSitterController } from './pet-sitter.controller';
import { PetSitterService } from './pet-sitter.service';

@Module({
  controllers: [PetSitterController],
  providers: [PetSitterService],
  exports: [PetSitterService],
})
export class PetSitterModule {}
