require('dotenv').config({
  path: `.env.stage.${process.env.STAGE}`,
});
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger, ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const logger = new Logger('');

  const config = new DocumentBuilder()
    .setTitle('Authentication Endpoints')
    .setDescription('All the available endpoints for authentication')
    .setVersion('1.0')
    .build();

  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe())

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT');
  await app.listen(port || 4000);
  logger.log(`App running in port ${port}`)
}
bootstrap();
