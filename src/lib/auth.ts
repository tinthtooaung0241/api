import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

export const createAuth = (
  configService: ConfigService,
  prismaService: PrismaService,
) => {
  return betterAuth({
    database: prismaAdapter(prismaService, {
      provider: 'postgresql',
    }),
    emailAndPassword: {
      enabled: true,
    },
    socialProviders: {
      google: {
        clientId: configService.get<string>('GOOGLE_CLIENT_ID') || '',
        clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET') || '',
      },
    },
    secret: configService.get<string>('BETTER_AUTH_SECRET'),
    baseURL:
      configService.get<string>('BETTER_AUTH_URL') || 'http://localhost:3000',
  });
};
