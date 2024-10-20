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
  QualificationModule,
  CustomerModule,
  BreedModule,
  AnimalTypeModule,
  ReportModule,
} from './modules';

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
    ReportModule
  ],
})
export class AppModule { }
