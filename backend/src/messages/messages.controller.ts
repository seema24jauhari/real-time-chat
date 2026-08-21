import { BadRequestException, Controller, Post, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common'
import { S3Service } from '../s3/s3.service'
import { FileInterceptor } from '@nestjs/platform-express'
import { memoryStorage } from 'multer'
import { MessagesService } from './messages.service'
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard'

@Controller('messages')
export class MessagesController {
  constructor(
    private messagesService: MessagesService,
    private s3Service: S3Service
  ) {}

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', {
    storage: memoryStorage(), // store in memory, then upload to S3
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
    fileFilter: (req, file, cb) => {
      const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']
      allowed.includes(file.mimetype) ? cb(null, true) : cb(new BadRequestException('File type not allowed'), false)
    }
  }))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any
  ) {
    const url = await this.s3Service.upload(file, 'chat-attachments')
    return { url, filename: file.originalname, mimetype: file.mimetype }
  }
}