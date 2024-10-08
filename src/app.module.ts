import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ConfigModule } from '@nestjs/config';
import {
  UserModule,
  PetSitterModule,
  ActivityModule,
  PaymentModule,
  PetModule,
  RequestModule,
  AuthModule,
} from './modules';
import { QualificationModule } from './modules/qualification/qualification.module';
import { BreedModule } from './modules/breeds/breeds.module';
import { AnimalTypeModule } from './modules/animal-types/animal-types.module';
import { CustomerModule } from './modules/customer/customer.module';
import { AdminModule } from './modules/admin/admin.module';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './common/guards/roles.guard';
import { JwtAuthGuard } from './modules/auth/guard/jwt-auth.guard';
import { RefreshJwtAuthGuard } from './modules/auth/guard/refresh-auth.guard';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    MulterModule.registerAsync({
      useFactory: () => ({
        dest: './uploads',
      }),
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/attachments/',
    }),
    AuthModule,
    UserModule,
    PetSitterModule,
    ActivityModule,
    PaymentModule,
    PetModule,
    RequestModule,
    QualificationModule,
    BreedModule,
    AnimalTypeModule,
    CustomerModule,
    AdminModule
  ],
})
export class AppModule { }
