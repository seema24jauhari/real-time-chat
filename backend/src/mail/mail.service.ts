import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as nodemailer from 'nodemailer'

@Injectable()
export class MailService {
  private transporter

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST'), // e.g. smtp.gmail.com
      port: Number(this.configService.get('SMTP_PORT')), // 465 (SSL) or 587 (STARTTLS)
      secure: Number(this.configService.get('SMTP_PORT')) === 465,
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
    });
  }

  async sendResetEmail(email: string, token: string) {
    const link = `${this.configService.get('FRONTEND_URL')}/reset-password?token=${token}`

    const { accepted, rejected } = await this.transporter.sendMail({
      from: this.configService.get('SMTP_USER'),
      to: email,
      subject: 'Reset your password',
      html: `<p>Click <a href="${link}">here</a> to reset your password. Expires in 1 hour.</p>`,
    })

    if (rejected.length > 0) {
      throw new Error(`Email rejected for: ${rejected.join(', ')}`)
    }

    console.log('Email sent to:', accepted)
  }
}