import { ConfigService } from '@nestjs/config';
const transport = require('nodemailer-ses-transport')
require('dotenv').config({path:`.env.stage.${process.env.STAGE}`})

const configService = new ConfigService();
const awsConfig = {
  region: configService.get<string>('SES_AWS_REGION'),
  accessKeyId: configService.get<string>('SES_AWS_ACCESS_KEY_ID'),
  secretAccessKey: configService.get<string>('SES_AWS_SECRET_ACCESS_KEY'),
};
console.log({awsConfig});

export default transport(awsConfig);