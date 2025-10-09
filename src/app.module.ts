import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import configuration from './config/configuration';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { createAuth } from './lib/auth';
import { PrismaModule } from './prisma/prisma.module';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      skipProcessEnv: true,
    }),
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
