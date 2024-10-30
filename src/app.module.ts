import { ScheduleModule } from '@nestjs/schedule';
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
  FavouriteModule,
  NotificationModule,
  ReviewModule,
} from './modules';
console.log('Static files served from:', join(__dirname, '..', 'uploads'));

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MulterModule.registerAsync({
      useFactory: () => ({
        dest: './uploads',
      }),
    }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/attachments/',
    }),
    ScheduleModule.forRoot(),
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
    ReportModule,
    NotificationModule,
    FavouriteModule,
    ReviewModule,
  ],
})
export class AppModule { }
