import { Injectable, BadRequestException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { CreateImageDto } from './dto/create-image.dto';
import { UpdateImageDto } from './dto/update-image.dto';
import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';
import { createWorker } from 'tesseract.js';
import OpenAI from 'openai';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ImageService {
  private openai: OpenAI;

  constructor(private readonly configService: ConfigService) {
    console.log('🚀 - ImageService - constructor - this.configService:', this.configService.get('OPENAI_API_KEY'));
    this.openai = new OpenAI({
      apiKey: this.configService.get('OPENAI_API_KEY'),
    });
  }

  async preprocessImage(filePath: string): Promise<string> {
    const outputPath = path.join(path.dirname(filePath), `preprocessed_${path.basename(filePath)}`);
    await sharp(filePath)
      .greyscale() // 转换为灰度图
      .normalize() // 标准化图像亮度和对比度
      .sharpen() // 锐化图像
      .resize({ 
        fit: sharp.fit.inside,
        withoutEnlargement: true,
      })
      .jpeg({ quality: 100, force: false })
      .png({ force: false })
      .webp({ force: false })
      .tiff({ force: false })
      .toFile(outputPath);
    return outputPath;
  }

  async analyzeImage(filePath: string) {
    try {
      const preprocessedFilePath = await this.preprocessImage(filePath);
      
      const worker = await createWorker('chi_sim');
      const { data: { text } } = await worker.recognize(preprocessedFilePath);
      console.log('🚀 - ImageService - analyzeImage - text:', text)
      await worker.terminate();

      // 删除预处理后的临时文件
      fs.unlinkSync(preprocessedFilePath);
      
      return {
        id: uuidv4(),
        result: `图片中识别到的文字：${text}`
      };
    } catch (error) {
      console.error('OCR 处理失败:', error);
      throw new BadRequestException('OCR 处理失败');
    }
  }

  async analyzeImageWithOpenAI(filePath: string) {
    try {
      const image = await fs.promises.readFile(filePath, { encoding: 'base64' });
      const response = await this.openai.chat.completions.create({
        model: "gpt-4-vision-preview",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: "蛋白质、脂肪、碳水、钠、能量，分别是多少？" },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${image}`,
                },
              },
            ],
          },
        ],
      });

      console.log('🚀 - ImageService - analyzeImageWithOpenAI - response:', response.choices[0].message.content);

      return {
        id: uuidv4(),
        result: response.choices[0].message.content
      };
    } catch (error) {
      console.error('OpenAI 图像分析失败:', error);
      throw new BadRequestException('OpenAI 图像分析失败');
    }
  }

  // 处理并分析图片
  async processAndAnalyzeImage(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('没有上传文件');
    }

    try {
      const result = await this.analyzeImage(file.path);
      return result;
    } catch (error) {
      console.error('图片分析失败:', error);
      throw new BadRequestException('图片分析失败');
    }
  }

  // 处理并使用 OpenAI 分析图片
  async processAndAnalyzeImageWithOpenAI(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('没有上传文件');
    }

    try {
      const result = await this.analyzeImageWithOpenAI(file.path);
      return result;
    } catch (error) {
      console.error('图片分析失败:', error);
      throw new BadRequestException('图片分析失败');
    }
  }

  create(createImageDto: CreateImageDto) {
    return 'This action adds a new image';
  }

  findAll() {
    return `This action returns all image`;
  }

  findOne(id: number) {
    return `This action returns a #${id} image`;
  }

  update(id: number, updateImageDto: UpdateImageDto) {
    return `This action updates a #${id} image`;
  }

  remove(id: number) {
    return `This action removes a #${id} image`;
  }
}
