import { Controller, Post, Body, UseGuards, HttpException, HttpStatus, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { SnakeDetectionDto } from './dto/snake-detection.dto';
import { ChatbotQueryDto } from './dto/chatbot-query.dto';

@ApiTags('ai')
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('detect')
  @ApiOperation({ summary: 'Detect snake species from image' })
  @ApiResponse({ 
    status: 200, 
    description: 'Snake species detected successfully',
    schema: {
      type: 'object',
      properties: {
        species: { type: 'string', example: 'Dendroaspis polylepis' },
        commonName: { type: 'string', example: 'Black Mamba' },
        confidence: { type: 'number', example: 0.95 },
        riskLevel: { type: 'string', example: 'CRITICAL' },
        venomType: { type: 'string', example: 'Neurotoxic' },
        treatmentNotes: { type: 'string', example: 'Requires immediate antivenom...' },
        dataSource: { type: 'string', example: 'WHO Snakebite Database' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid image or AI service error' })
  @ApiResponse({ status: 503, description: 'AI service unavailable' })
  async detectSnake(@Body() snakeDetectionDto: SnakeDetectionDto) {
    try {
      const result = await this.aiService.detectSnakeSpecies(snakeDetectionDto);
      
      // Validate AI confidence threshold
      if (result.confidence < 0.8) {
        return {
          ...result,
          warning: 'AI uncertain — manual review required.',
          recommendation: 'Please consult with a medical professional for accurate identification.'
        };
      }
      
      return result;
    } catch (error) {
      throw new HttpException(
        {
          message: 'Snake detection failed',
          error: error.message,
          recommendation: 'Please try again or consult with a medical professional.'
        },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Post('upload-and-detect')
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({ summary: 'Upload image and detect snake species' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ 
    status: 200, 
    description: 'Snake species detected successfully',
    schema: {
      type: 'object',
      properties: {
        species: { type: 'string', example: 'Dendroaspis polylepis' },
        commonName: { type: 'string', example: 'Black Mamba' },
        confidence: { type: 'number', example: 0.95 },
        riskLevel: { type: 'string', example: 'CRITICAL' },
        venomType: { type: 'string', example: 'Neurotoxic' },
        treatmentNotes: { type: 'string', example: 'Requires immediate antivenom...' },
        dataSource: { type: 'string', example: 'WHO Snakebite Database' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid image or AI service error' })
  @ApiResponse({ status: 503, description: 'AI service unavailable' })
  async uploadAndDetect(
    @UploadedFile() file: Express.Multer.File,
    @Body('userId') userId: string,
    @Body('sessionId') sessionId: string,
    @Body('location') location?: string
  ) {
    try {
      if (!file) {
        throw new BadRequestException('No image file provided');
      }

      // Create a data URL for the uploaded file
      const imageUrl = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
      
      const result = await this.aiService.detectSnakeSpeciesFromFile(file, userId, sessionId, location ? JSON.parse(location) : undefined);
      
      // Validate AI confidence threshold
      if (result.confidence < 0.8) {
        return {
          ...result,
          warning: 'AI uncertain — manual review required.',
          recommendation: 'Please consult with a medical professional for accurate identification.'
        };
      }
      
      return result;
    } catch (error) {
      throw new HttpException(
        {
          message: 'Snake detection failed',
          error: error.message,
          recommendation: 'Please try again or consult with a medical professional.'
        },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Post('chat')
  @ApiOperation({ summary: 'Get first aid guidance from AI chatbot' })
  @ApiResponse({ 
    status: 200, 
    description: 'First aid guidance provided successfully',
    schema: {
      type: 'object',
      properties: {
        response: { type: 'string', example: 'Stay calm and keep the victim still...' },
        confidence: { type: 'number', example: 0.9 },
        dataSource: { type: 'string', example: 'WHO Guidelines for Snakebite Management' },
        disclaimer: { type: 'string', example: 'This is general guidance. Seek immediate medical attention.' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid query or AI service error' })
  @ApiResponse({ status: 503, description: 'AI service unavailable' })
  async chat(@Body() chatbotQueryDto: ChatbotQueryDto) {
    try {
      const result = await this.aiService.getFirstAidGuidance(chatbotQueryDto);
      
      // Validate AI confidence threshold
      if (result.confidence < 0.8) {
        return {
          ...result,
          warning: 'AI uncertain — manual review required.',
          recommendation: 'Please consult with a medical professional for accurate guidance.'
        };
      }
      
      return result;
    } catch (error) {
      throw new HttpException(
        {
          message: 'Chatbot query failed',
          error: error.message,
          recommendation: 'Please try again or consult with a medical professional.'
        },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Post('validate-model')
  @ApiOperation({ summary: 'Validate AI model accuracy' })
  @ApiResponse({ status: 200, description: 'Model validation completed' })
  @ApiBearerAuth()
  async validateModel() {
    try {
      const result = await this.aiService.validateModelAccuracy();
      return result;
    } catch (error) {
      throw new HttpException(
        {
          message: 'Model validation failed',
          error: error.message
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
