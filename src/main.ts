require('dotenv').config({
  path: `.env.stage.${process.env.STAGE}`,
});
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger, ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as passport from 'passport';
import * as session from 'express-session';
import RedisStore from "connect-redis"
import { createClient } from 'redis';

async function bootstrap() {
  const logger = new Logger('');

  const config = new DocumentBuilder()
    .setTitle('Authentication Endpoints')
    .setDescription('All the available endpoints for authentication')
    .setVersion('1.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' })
    .build();

  const redisClient = await createClient({
    url: 'redis://localhost:6379'
  });

  await redisClient.connect() 

  redisClient.select(2)

  const redisStore = new RedisStore({
    client: redisClient,
    prefix: "myapp:",
  })

  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe()); // whitelisting is giving issue in custom pipe so removed for now

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT');

  app.use(
    session({
      secret: configService.get<string>('SESSION_SECRET'),
      cookie: { maxAge: 5 * 1000 },
      saveUninitialized: false,
      resave: false,
      store: redisStore
    }),
  );

  app.use(passport.initialize());
  app.use(passport.session());

  await app.listen(port || 4000);
  logger.log(`App running in port ${port}`);
}
bootstrap();
