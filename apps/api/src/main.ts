import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
    credentials: true,
  });
  await app.listen(process.env.API_PORT ?? 3000);
  console.log(`API running on http://localhost:${process.env.API_PORT ?? 3000}`);
}
bootstrap();
