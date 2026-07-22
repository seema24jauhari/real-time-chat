import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as nodemailer from 'nodemailer'

@Injectable()
export class MailService {
  private transporter

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASS'),
      },
    })
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