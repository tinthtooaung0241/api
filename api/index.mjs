import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import { AppModule } from '../dist/app.module.js';

let cachedApp;

async function createApp() {
  if (cachedApp) {
    return cachedApp;
  }

  const expressApp = express();
  const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp), {
    logger: false,
  });

  // Enable CORS
  app.enableCors({
    origin: true,
    credentials: true,
  });

  await app.init();
  cachedApp = expressApp;
  return expressApp;
}

export default async (req, res) => {
  const app = await createApp();
  return app(req, res);
};

