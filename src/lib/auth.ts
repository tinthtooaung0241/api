import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

export const createAuth = (
  configService: ConfigService,
  prismaService: PrismaService,
) => {
  const webUrl =
    configService.get<string>('WEB_URL') || 'http://localhost:3000';
  const allowedOrigins = [
    webUrl,

    'http://localhost:3001',
    ...(process.env.ALLOWED_ORIGINS?.split(',') || []),
  ].filter(Boolean);

  return betterAuth({
    trustedOrigins: allowedOrigins,
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
    baseURL: configService.get<string>('WEB_URL') || 'http://localhost:3000',
    plugins: [],
    user: {
      additionalFields: {
        isSubscribed: {
          type: 'boolean',
          required: false,
        },
      },
    },
  });
};
