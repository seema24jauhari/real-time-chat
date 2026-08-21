import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { v4 as uuid } from 'uuid'

@Injectable()
export class S3Service {
  private s3: S3Client

  constructor(private config: ConfigService) {
    this.s3 = new S3Client({
        region: this.config.getOrThrow<string>('AWS_REGION'),
        credentials: {
            accessKeyId: this.config.getOrThrow<string>('AWS_ACCESS_KEY_ID'),
            secretAccessKey: this.config.getOrThrow<string>('AWS_SECRET_ACCESS_KEY'),
        }
    })
  }

  async upload(file: Express.Multer.File, folder: string): Promise<string> {
    const key = `${folder}/${uuid()}-${file.originalname}`

    await this.s3.send(new PutObjectCommand({
      Bucket: this.config.get('AWS_S3_BUCKET'),
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    }))

    return `https://${this.config.get('AWS_S3_BUCKET')}.s3.${this.config.get('AWS_REGION')}.amazonaws.com/${key}`
  }
}