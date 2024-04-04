import { Injectable, Logger } from '@nestjs/common';
const nodemailer = require('nodemailer');
import transport from './ses.transport';
import { ConfigService } from '@nestjs/config';
import { Transporter } from 'nodemailer';
import * as handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class EmailService {
  private readonly transporter: Transporter;
  private readonly logger = new Logger('Email Service');

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport(transport)
  }

  async sendVerificationEmail(email: string, token: string, username: string) {
    try {
      const ip = this.configService.get<string>('IP')
      const port = this.configService.get<string>('PORT')
      const protocol = this.configService.get<string>('PROTOCOL')
      const address = `${protocol}://${ip}:${port}`

      const verificationURL = `${address}/user/verify-email?token=${token}&username=${username}`
      const logoUrl = `cid:companyLogoForEmail`
      const fileName = 'emailVerificationTemplate.hbs'
      const templateSource = fs.readFileSync(path.resolve(__dirname, '..', '..', 'templates', fileName), 'utf-8');
      const template = handlebars.compile(templateSource);
      const html = template({ verificationURL, logoUrl });

      const result = await this.transporter.sendMail({
        from: this.configService.get<string>('SES_SENDER_EMAIL'),
        to: email,
        subject: 'Verification email from AnimeFlix',
        html,
        attachments: [{
          filename: 'companyLogoForEmail.png',
          path: path.resolve(__dirname, '..', '..', 'public', 'companyLogoForEmail.png'),
          cid: 'companyLogoForEmail'
        }]
      });

      this.logger.log('Verification email sent successfully:', result.messageId);
    } catch (error) {
      this.logger.error('Error sending verification email:', error);
      throw new Error('Failed to send verification email.');
    }
  }
}