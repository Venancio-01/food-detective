import { Controller, Post, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { ImageService } from './image.service';

@Controller('image')
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @Post('analyze')
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const randomName = uuidv4();
        return cb(null, `${randomName}${extname(file.originalname)}`);
      },
    }),
  }))
  async analyzeImage(@UploadedFile() file: Express.Multer.File) {
    console.log('🚀 - ImageController - analyzeImage - file:', file)
    return this.imageService.processAndAnalyzeImage(file);
    // return this.imageService.processAndAnalyzeImageWithOpenAI(file);
  }

  @Post('analyze-openai')
  @UseInterceptors(FileInterceptor('file'))
  async analyzeImageWithOpenAI(@UploadedFile() file: Express.Multer.File) {
    console.log('🚀 - ImageController - analyzeImageWithOpenAI - file:', file)
    return this.imageService.processAndAnalyzeImage(file);
    // return this.imageService.processAndAnalyzeImageWithOpenAI(file);
  }
}
