import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PetSitterService {
  constructor(private readonly prismaService: PrismaService) {}

  async getPetsitters() {
    return this.prismaService.petsitter.findMany({
      include: {
        user: true,
      },
    });
  }

  async getPetsitterById(id: string) {
    const petSitter = await this.prismaService.petsitter.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });

    if (!petSitter) {
      throw new NotFoundException(`Pet Sitter not found`);
    }
    return petSitter;
  }
}
