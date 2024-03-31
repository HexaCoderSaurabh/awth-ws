import { Injectable, Logger } from '@nestjs/common';
const nodemailer = require('nodemailer');
import transport from './ses.transport';
import { ConfigService } from '@nestjs/config';
import { Transporter } from 'nodemailer';

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
      const result = await this.transporter.sendMail({
        from: this.configService.get<string>('SES_SENDER_EMAIL'),
        to: '2021.saurabh.agrawal@gmail.com', //Change this to email variable
        subject: 'Verification email from AnimeFlix',
        html: `<p>Click the link below to verify your email address:</p><p><a href="${address}/user/verify-email?token=${token}&username=${username}" target="_balnk">Verify Email</a></p>`,
      });

      this.logger.log('Verification email sent successfully:', result.messageId);
    } catch (error) {
      this.logger.error('Error sending verification email:', error);
      throw new Error('Failed to send verification email.');
    }
  }
}