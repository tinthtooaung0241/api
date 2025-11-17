import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { PrismaService } from '../prisma/prisma.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { createAuth } from '../lib/auth';

@Module({
  controllers: [AuthController],
  providers: [
    PrismaService,
    AuthService,
    {
      provide: 'BETTER_AUTH',
      useFactory: (
        configService: ConfigService,
        prismaService: PrismaService,
      ) => {
        return createAuth(configService, prismaService);
      },
      inject: [ConfigService, PrismaService],
    },
  ],
  exports: ['BETTER_AUTH'],
})
export class AuthModule {}
