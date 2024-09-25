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
  UploadModule,
  AuthModule,
} from './modules';
import { QualificationModule } from './modules/qualification/qualification.module';
import { BreedModule } from './modules/breeds/breeds.module';
import { AnimalTypeModule } from './modules/animal-types/animal-types.module';
import { CustomerModule } from './modules/customer/customer.module';
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
    UploadModule,
    QualificationModule,
    BreedModule,
    AnimalTypeModule,
    CustomerModule],
})
export class AppModule { }
