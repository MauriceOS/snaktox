import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ContentService } from './content.service';
import { MediaService } from './media.service';
import { TranslationService } from './translation.service';
import { CreateContentDto } from './dto/create-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';
import { FindContentDto } from './dto/find-content.dto';
import { UploadMediaDto } from './dto/upload-media.dto';
import { CreateTranslationDto } from './dto/create-translation.dto';

@Controller('content')
export class ContentController {
  constructor(
    private readonly contentService: ContentService,
    private readonly mediaService: MediaService,
    private readonly translationService: TranslationService,
  ) {}

  @Post()
  create(@Body() createContentDto: CreateContentDto) {
    return this.contentService.create(createContentDto);
  }

  @Get()
  findAll(@Query() findContentDto: FindContentDto) {
    return this.contentService.findAll(findContentDto);
  }

  @Get('categories')
  getCategories() {
    return this.contentService.getContentCategories();
  }

  @Get('languages')
  getLanguages() {
    return this.contentService.getAvailableLanguages();
  }

  @Get('category/:category')
  getByCategory(
    @Param('category') category: string,
    @Query('language') language?: string,
  ) {
    return this.contentService.getContentByCategory(
      category,
      language || 'en',
    );
  }

  @Get('language/:language')
  getByLanguage(@Param('language') language: string) {
    return this.contentService.getContentByLanguage(language);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.contentService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateContentDto: UpdateContentDto) {
    return this.contentService.update(id, updateContentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.contentService.remove(id);
  }

  @Post(':id/verify')
  verifyContent(
    @Param('id') id: string,
    @Body('verifiedBy') verifiedBy: string,
  ) {
    return this.contentService.verifyContent(id, verifiedBy);
  }

  // Media endpoints
  @Post('media/upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadMedia(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadMediaDto: UploadMediaDto,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    return this.mediaService.uploadMedia(file, uploadMediaDto);
  }

  @Get('media/category/:category')
  getMediaByCategory(@Param('category') category: string) {
    return this.mediaService.getMediaByCategory(category);
  }

  @Get('media/statistics')
  getMediaStatistics() {
    return this.mediaService.getMediaStatistics();
  }

  @Delete('media/:id')
  deleteMedia(@Param('id') id: string) {
    return this.mediaService.deleteMedia(id);
  }

  // Translation endpoints
  @Post('translations')
  createTranslation(@Body() createTranslationDto: CreateTranslationDto) {
    return this.translationService.createTranslation(createTranslationDto);
  }

  @Get('translations/:contentId')
  getTranslations(@Param('contentId') contentId: string) {
    return this.translationService.getTranslations(contentId);
  }

  @Get('translations/:contentId/:language')
  getContentInLanguage(
    @Param('contentId') contentId: string,
    @Param('language') language: string,
  ) {
    return this.translationService.getContentInLanguage(contentId, language);
  }

  @Get('translations/supported-languages')
  getSupportedLanguages() {
    return this.translationService.getSupportedLanguages();
  }

  @Get('translations/statistics')
  getLanguageStatistics() {
    return this.translationService.getLanguageStatistics();
  }

  @Get('translations/missing')
  getMissingTranslations() {
    return this.translationService.getMissingTranslations();
  }

  @Get('translations/progress')
  getTranslationProgress() {
    return this.translationService.getTranslationProgress();
  }
}
