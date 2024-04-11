import { Injectable, Logger } from '@nestjs/common';
import transport from './ses.transport';
import { ConfigService } from '@nestjs/config';
const nodemailer = require('nodemailer');
import { Transporter } from 'nodemailer';
import * as handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class EmailService {
  private readonly transporter: Transporter;
  private readonly logger = new Logger('Email Service');

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport(transport);
  }

  async sendVerificationEmail(email: string, token: string, username: string) {
    try {
      const ip = this.configService.get<string>('IP')
      const port = this.configService.get<string>('PORT')
      const protocol = this.configService.get<string>('PROTOCOL')
      const address = `${protocol}://${ip}:${port}`

      const verificationURL = `${address}/user/verify-email?token=${token}&username=${username}`
      const fileName = 'emailVerificationTemplate.hbs'
      const templateSource = fs.readFileSync(path.resolve(__dirname, '..', '..', 'templates', fileName), 'utf-8');
      
      const logoPath = path.resolve(__dirname, '..', '..', 'assets', 'logo.png');

      const template = handlebars.compile(templateSource);
      const html = template({ verificationURL, logoPath });
      console.log(html, logoPath, verificationURL);
      
      const result = await this.transporter.sendMail({
        from: this.configService.get<string>('SES_SENDER_EMAIL'),
        to: email,
        subject: 'Verification email from AnimeFlix',
        html,
        attachments: [{
          filename: 'logo.png',
          path: logoPath,
          cid: 'logo'
      }]
      });
      this.logger.log('Verification email sent successfully:', result.messageId);
    } catch (error) {
      this.logger.error('Error sending verification email:', error);
      throw new Error('Failed to send verification email.');
    }
  }
}