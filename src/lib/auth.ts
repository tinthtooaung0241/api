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
    'https://web-peach-one-55.vercel.app', // Explicitly add Vercel domain
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
    baseURL: webUrl, // Frontend URL - cookies will be set for this domain
    basePath: '/api/auth',

    advanced: {
      cookiePrefix: '',
      crossSubDomainCookies: {
        enabled: true, // Enable for cross-domain in production
        // This automatically sets SameSite=None and Secure for cross-domain cookies
        // Cookies will be set for the baseURL domain (frontend), not the backend domain
        domain: webUrl,
      },
    },
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
