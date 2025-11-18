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

  // Detect if we're in development (localhost)
  const isDevelopment =
    webUrl.includes('localhost') || webUrl.includes('127.0.0.1');
  const isProduction = !isDevelopment;

  // Extract domain from webUrl (remove protocol and path)
  const getDomain = (url: string): string | undefined => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch {
      return undefined;
    }
  };

  const webDomain = getDomain(webUrl);

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
        redirectURI: `${webUrl}/api/auth/callback/google`, // Explicitly set callback URL to frontend domain
      },
    },
    secret: configService.get<string>('BETTER_AUTH_SECRET'),
    baseURL: webUrl, // Frontend URL - cookies will be set for this domain
    basePath: '/api/auth',
    advanced: {
      //cookies configuration
      cookies: {
        state: {
          attributes: {
            sameSite: isDevelopment ? 'lax' : 'none',
            secure: isProduction, // Only require HTTPS in production
            // Ensure state cookie persists long enough for OAuth flow
            maxAge: 600, // 10 minutes - enough time for OAuth redirect
          },
        },
      },
      cookiePrefix: '',
      crossSubDomainCookies:
        isProduction && webDomain
          ? {
              enabled: true, // Enable for cross-domain in production
              // This automatically sets SameSite=None and Secure for cross-domain cookies
              // Cookies will be set for the baseURL domain (frontend), not the backend domain
              domain: webDomain, // Use just the domain, not the full URL
            }
          : undefined, // Disable cross-subdomain cookies in development
      // Explicitly set cookie attributes for OAuth state cookies to avoid CSRF attacks
      defaultCookieAttributes: {
        sameSite: isDevelopment ? 'lax' : 'none',
        secure: isProduction, // Only require HTTPS in production
        httpOnly: true,
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
