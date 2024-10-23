import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { PetSitterService } from './pet-sitter.service';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

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
