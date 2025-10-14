import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import configuration from './config/configuration';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { createAuth } from './lib/auth';
import { PrismaModule } from './prisma/prisma.module';
import { PrismaService } from './prisma/prisma.service';
import { UploadModule } from './upload/upload.module';
import { ProductsModule } from './products/products.module';
import { AuctionsModule } from './auctions/auctions.module';
import { BidsModule } from './bids/bids.module';
import { OrdersModule } from './orders/orders.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      skipProcessEnv: true,
    }),
    ScheduleModule.forRoot(),
    AuthModule.forRootAsync({
      imports: [PrismaModule],
      useFactory: (
        configService: ConfigService,
        prismaService: PrismaService,
      ) => ({
        auth: createAuth(configService, prismaService),
      }),
      inject: [ConfigService, PrismaService],
    }),
    PrismaModule,
    UploadModule,
    ProductsModule,
    AuctionsModule,
    BidsModule,
    OrdersModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
