import { Controller, Get, Param, } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

import { PetSitterService } from './pet-sitter.service';

@ApiTags('pet-sitter')
@Controller('pet-sitter')
export class PetSitterController {
  constructor(private readonly petSitterService: PetSitterService) {}

  @ApiResponse({ status: 200 })
  @Get()
  async findAll() {
    return this.petSitterService.getPetsitters();
  }

  @ApiResponse({ status: 200 })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.petSitterService.getPetsitterById(id);
  }
}
