import { Module } from '@nestjs/common';
import { PetController } from './pets.controller';
import { PetService } from './pets.service';
import { PrismaModule } from '../prisma/prisma.module';
import { BreedModule } from '../breeds/breeds.module';
import { AnimalTypeModule } from '../animal-types/animal-types.module';
import { CustomerModule } from '../customer/customer.module';

@Module({
  imports: [PrismaModule, BreedModule, AnimalTypeModule, CustomerModule],
  controllers: [PetController],
  providers: [PetService]
})
export class PetModule { }
