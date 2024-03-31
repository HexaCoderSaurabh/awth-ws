import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigValidationSchema } from './config.schema';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CustomNamingStrategy } from './helper/customNamingStrategy';
import { EmailModule } from './email/email.module';
@Module({
  imports: [
    UserModule,
    ConfigModule.forRoot({
      envFilePath: [`.env.stage.${process.env.STAGE}`],
      validationSchema: ConfigValidationSchema,
      cache: true
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService): Promise<TypeOrmModuleOptions> => {
        return {
          type: configService.get('DB_TYPE'),
          host: configService.get('DB_HOST'),
          port: configService.get('DB_PORT'),
          username: configService.get('DB_USERNAME'),
          password: configService.get('DB_PASSWORD'),
          database: configService.get('DB_NAME'),
          logging: false,
          entities: ['dist/**/*.entity{.ts,.js}'],
          synchronize: true,
          namingStrategy: new CustomNamingStrategy(),
          extra: {
            dialectOptions: {
              decimalNumbers: true,
            },
          }
        };
      }
    }),
    EmailModule,
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule { }
