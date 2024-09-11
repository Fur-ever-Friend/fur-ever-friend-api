import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { PetSitterModule } from './modules/pet-sitter/pet-sitter.module';
import { ActivityModule } from './modules/activity/activity.module';
import { PaymentModule } from './modules/payment/payment.module';
import { PetsModule } from './modules/pets/pets.module';
import { RequestModule } from './modules/request/request.module';

@Module({
  imports: [UsersModule, PetSitterModule, ActivityModule, PaymentModule, PetsModule, RequestModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
