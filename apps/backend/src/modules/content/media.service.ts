import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { UploadMediaDto } from './dto/upload-media.dto';

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);
  private readonly allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
  private readonly allowedVideoTypes = ['video/mp4', 'video/webm'];
  private readonly maxFileSize = 10 * 1024 * 1024; // 10MB

  constructor(private readonly prisma: PrismaService) {}

  async uploadMedia(file: Express.Multer.File, uploadMediaDto: UploadMediaDto) {
    this.logger.log(`Uploading media: ${file.originalname}`);
    
    // Validate file
    this.validateFile(file);
    
    // Generate unique filename
    const filename = this.generateFilename(file.originalname);
    
    // In a real implementation, you would upload to cloud storage (S3, etc.)
    // For now, we'll simulate the upload
    const mediaUrl = `https://media.snaktox.com/${uploadMediaDto.category}/${filename}`;
    
    // Store media metadata in database
    const media = await this.prisma.analyticsLog.create({
      data: {
        eventType: 'media_upload',
        metadata: {
          filename: file.originalname,
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          url: mediaUrl,
          category: uploadMediaDto.category,
          description: uploadMediaDto.description,
          tags: uploadMediaDto.tags || [],
          uploadedAt: new Date().toISOString(),
        },
      },
    });

    this.logger.log(`Media uploaded with ID: ${media.id}`);
    return {
      id: media.id,
      url: mediaUrl,
      filename: file.originalname,
      size: file.size,
      mimeType: file.mimetype,
      category: uploadMediaDto.category,
    };
  }

  async getMediaByCategory(category: string) {
    this.logger.log(`Getting media for category: ${category}`);
    
    const media = await this.prisma.analyticsLog.findMany({
      where: {
        eventType: 'media_upload',
        metadata: {
          path: ['category'],
          equals: category,
        },
      },
      orderBy: { timestamp: 'desc' },
    });

    return media.map(item => ({
      id: item.id,
      url: item.metadata['url'],
      filename: item.metadata['filename'],
      size: item.metadata['size'],
      mimeType: item.metadata['mimeType'],
      category: item.metadata['category'],
      description: item.metadata['description'],
      tags: item.metadata['tags'],
      uploadedAt: item.metadata['uploadedAt'],
    }));
  }

  async deleteMedia(id: string) {
    this.logger.log(`Deleting media with ID: ${id}`);
    
    const media = await this.prisma.analyticsLog.findUnique({
      where: { id },
    });

    if (!media || media.eventType !== 'media_upload') {
      throw new BadRequestException('Media not found');
    }

    // In a real implementation, you would delete from cloud storage
    await this.prisma.analyticsLog.delete({
      where: { id },
    });

    this.logger.log(`Media deleted: ${id}`);
    return { message: 'Media deleted successfully' };
  }

  private validateFile(file: Express.Multer.File) {
    // Check file size
    if (file.size > this.maxFileSize) {
      throw new BadRequestException('File size exceeds maximum allowed size (10MB)');
    }

    // Check file type
    const isImage = this.allowedImageTypes.includes(file.mimetype);
    const isVideo = this.allowedVideoTypes.includes(file.mimetype);
    
    if (!isImage && !isVideo) {
      throw new BadRequestException(
        'Invalid file type. Only images (JPEG, PNG, WebP) and videos (MP4, WebM) are allowed'
      );
    }
  }

  private generateFilename(originalName: string): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = originalName.split('.').pop();
    return `${timestamp}_${randomString}.${extension}`;
  }

  async getMediaStatistics() {
    this.logger.log('Getting media statistics');
    
    const totalMedia = await this.prisma.analyticsLog.count({
      where: { eventType: 'media_upload' },
    });

    const mediaByCategory = await this.prisma.analyticsLog.groupBy({
      by: ['metadata'],
      where: { eventType: 'media_upload' },
      _count: true,
    });

    // Calculate total size manually from metadata
    const mediaLogs = await this.prisma.analyticsLog.findMany({
      where: { eventType: 'media_upload' },
      select: { metadata: true },
    });
    
    const totalSize = mediaLogs.reduce((sum, log) => {
      const size = (log.metadata as any)?.fileSize || 0;
      return sum + size;
    }, 0);

    return {
      totalMedia,
      mediaByCategory: mediaByCategory.map(item => ({
        category: item.metadata['category'],
        count: item._count,
      })),
      totalSize: 0, // Would be calculated from actual file sizes
    };
  }
}
