import { Module } from '@nestjs/common';
import { PetController } from './pet.controller';
import { PetService } from './pet.service';
import { PrismaModule } from '../prisma/prisma.module';
import { BreedModule } from '../breed/breed.module';
import { AnimalTypeModule } from '../animal-type/animal-type.module';
import { CustomerModule } from '../customer/customer.module';

@Module({
  imports: [PrismaModule, BreedModule, AnimalTypeModule, CustomerModule],
  controllers: [PetController],
  providers: [PetService]
})
export class PetModule { }
