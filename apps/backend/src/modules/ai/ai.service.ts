import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { PrismaService } from '../../common/prisma/prisma.service';
import { SnakeDetectionDto } from './dto/snake-detection.dto';
import { ChatbotQueryDto } from './dto/chatbot-query.dto';
import { first } from 'rxjs/operators';
import * as FormData from 'form-data';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly aiServiceUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly prisma: PrismaService,
  ) {
    this.aiServiceUrl = this.configService.get('AI_SERVICE_URL', 'http://localhost:8000');
  }

  async detectSnakeSpeciesFromFile(file: Express.Multer.File, userId: string, sessionId: string, location?: any) {
    this.logger.log('Processing snake species detection from file upload');
    
    try {
      // Create FormData for file upload to AI service using form-data package
      const formData = new FormData();
      formData.append('image', Buffer.from(file.buffer), {
        filename: file.originalname,
        contentType: file.mimetype,
      });
      formData.append('userId', userId);
      formData.append('sessionId', sessionId);
      if (location) {
        formData.append('location', JSON.stringify(location));
      }

      // Call Python FastAPI AI service upload endpoint
      // form-data package provides headers with boundary automatically
      this.logger.log(`Calling AI service for image detection: ${this.aiServiceUrl}/api/v1/upload-and-detect`);

      const response = await this.httpService.post(
        `${this.aiServiceUrl}/api/v1/upload-and-detect`,
        formData,
        {
          headers: formData.getHeaders(),
        }
      ).pipe(first()).toPromise();

      const aiResult = (response as any).data;
      
      this.logger.log(`AI service response received - success: ${aiResult?.success}, hasResult: ${!!aiResult?.result}`);
      
      // Validate AI response
      if (!aiResult || !aiResult.success) {
        this.logger.error(`AI service returned error: ${aiResult?.error || 'Unknown error'}`);
        throw new Error(aiResult?.error || 'Invalid AI service response');
      }

      if (!aiResult.result || !aiResult.result.species || aiResult.result.confidence === undefined) {
        this.logger.error(`Invalid AI response structure: ${JSON.stringify(aiResult)}`);
        throw new Error('Invalid AI service response structure');
      }

      const detectionResult = aiResult.result;
      
      // Get verified snake species data from database
      const snakeSpecies = await this.prisma.snakeSpecies.findFirst({
        where: {
          scientificName: detectionResult.species.scientific_name,
        },
        include: {
          venomType: true,
        },
      });

      if (!snakeSpecies) {
        this.logger.warn(`Snake species not found in database: ${detectionResult.species.scientific_name}`);
        return {
          species: detectionResult.species.scientific_name,
          commonName: detectionResult.species.common_name,
          confidence: detectionResult.confidence,
          riskLevel: detectionResult.species.severity,
          venomType: detectionResult.species.venom_type,
          treatmentNotes: detectionResult.species.first_aid_notes,
          dataSource: 'AI Detection - Not Verified',
          warning: 'Species not in verified database. Manual identification required.',
        };
      }

      // Log the detection for analytics
      await this.logDetectionEvent({ imageUrl: 'file-upload', userId, sessionId, location }, detectionResult, snakeSpecies);

      this.logger.log(`Snake species detected: ${snakeSpecies.commonName} (${detectionResult.confidence} confidence)`);
      
      return {
        species: snakeSpecies.scientificName,
        commonName: snakeSpecies.commonName,
        confidence: detectionResult.confidence,
        riskLevel: snakeSpecies.riskLevel,
        venomType: snakeSpecies.venomType.name,
        treatmentNotes: snakeSpecies.venomType.treatmentNotes,
        dataSource: snakeSpecies.source,
        lastVerified: snakeSpecies.lastVerified,
      };

    } catch (error) {
      this.logger.error('Snake detection from file failed:', error.message);
      
      if (error.response?.status === 503) {
        throw new HttpException(
          'AI service is currently unavailable. Please try again later.',
          HttpStatus.SERVICE_UNAVAILABLE
        );
      }
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

  async detectSnakeSpecies(snakeDetectionDto: SnakeDetectionDto) {
    this.logger.log('Processing snake species detection request');
    
    try {
      // Call Python FastAPI AI service
      const response = await this.httpService.post(`${this.aiServiceUrl}/api/v1/predict`, {
        image_url: snakeDetectionDto.imageUrl,
        confidence_threshold: 0.8,
      }).pipe(first()).toPromise();

      const aiResult = (response as any).data;
      
      // Validate AI response
      if (!aiResult.result || !aiResult.result.species || !aiResult.result.confidence) {
        throw new Error('Invalid AI service response');
      }

      const detectionResult = aiResult.result;
      
      // Get verified snake species data from database
      const snakeSpecies = await this.prisma.snakeSpecies.findFirst({
        where: {
          scientificName: detectionResult.species.scientific_name,
        },
        include: {
          venomType: true,
        },
      });

      if (!snakeSpecies) {
        this.logger.warn(`Snake species not found in database: ${detectionResult.species.scientific_name}`);
        return {
          species: detectionResult.species.scientific_name,
          commonName: detectionResult.species.common_name,
          confidence: detectionResult.confidence,
          riskLevel: detectionResult.species.severity,
          venomType: detectionResult.species.venom_type,
          treatmentNotes: detectionResult.species.first_aid_notes,
          dataSource: 'AI Detection - Not Verified',
          warning: 'Species not in verified database. Manual identification required.',
        };
      }

      // Log the detection for analytics
      await this.logDetectionEvent(snakeDetectionDto, detectionResult, snakeSpecies);

      this.logger.log(`Snake species detected: ${snakeSpecies.commonName} (${detectionResult.confidence} confidence)`);
      
      return {
        species: snakeSpecies.scientificName,
        commonName: snakeSpecies.commonName,
        confidence: detectionResult.confidence,
        riskLevel: snakeSpecies.riskLevel,
        venomType: snakeSpecies.venomType.name,
        treatmentNotes: snakeSpecies.venomType.treatmentNotes,
        dataSource: snakeSpecies.source,
        lastVerified: snakeSpecies.lastVerified,
      };

    } catch (error) {
      this.logger.error('Snake detection failed:', error.message);
      
      if (error.response?.status === 503) {
        throw new HttpException(
          'AI service is currently unavailable. Please try again later.',
          HttpStatus.SERVICE_UNAVAILABLE
        );
      }
      
      throw new HttpException(
        'Snake detection failed. Please try again or consult with a medical professional.',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  async getFirstAidGuidance(chatbotQueryDto: ChatbotQueryDto) {
    this.logger.log(`Processing first aid guidance request: ${chatbotQueryDto.query}`);
    
    try {
      // Call Python FastAPI chatbot service
      const requestBody = {
        query: chatbotQueryDto.query,
        language: chatbotQueryDto.language || 'en',
        user_id: chatbotQueryDto.userId || 'anonymous',
        session_id: chatbotQueryDto.sessionId || 'session-001',
        context: chatbotQueryDto.context || {},
      };

      this.logger.log(`Calling AI service: ${this.aiServiceUrl}/api/v1/chat`);

      const response = await this.httpService.post(`${this.aiServiceUrl}/api/v1/chat`, requestBody).pipe(first()).toPromise();

      const aiResult = (response as any).data;
      
      this.logger.log(`AI service response received - success: ${aiResult?.success}, hasResponse: ${!!aiResult?.response}`);
      
      // Validate AI response
      if (!aiResult || !aiResult.success) {
        this.logger.error(`AI service returned error: ${aiResult?.error || 'Unknown error'}`);
        throw new Error(aiResult?.error || 'Invalid AI service response');
      }

      if (!aiResult.response || aiResult.confidence === undefined) {
        this.logger.error(`Invalid AI response structure: ${JSON.stringify(aiResult)}`);
        throw new Error('Invalid AI service response structure');
      }

      // Get verified first aid data from database
      const firstAidMaterial = await this.prisma.educationMaterial.findFirst({
        where: {
          category: 'first_aid',
          language: chatbotQueryDto.language || 'en',
          isActive: true,
        },
        orderBy: { lastVerified: 'desc' },
      });

      // Log the chatbot interaction for analytics
      await this.logChatbotEvent(chatbotQueryDto, aiResult);

      this.logger.log(`First aid guidance provided (${aiResult.confidence} confidence)`);
      
      return {
        response: aiResult.response,
        confidence: aiResult.confidence,
        dataSource: firstAidMaterial?.source || 'WHO Guidelines for Snakebite Management',
        disclaimer: 'This is general guidance based on verified medical sources. Always seek immediate medical attention for snakebites.',
        lastVerified: firstAidMaterial?.lastVerified || new Date(),
      };

    } catch (error) {
      this.logger.error('First aid guidance failed:', error.message);
      
      if (error.response?.status === 503) {
        throw new HttpException(
          'AI chatbot is currently unavailable. Please try again later.',
          HttpStatus.SERVICE_UNAVAILABLE
        );
      }
      
      throw new HttpException(
        'First aid guidance failed. Please consult with a medical professional immediately.',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  async validateModelAccuracy() {
    this.logger.log('Validating AI model accuracy');
    
    try {
      // Call Python FastAPI model validation endpoint
      const response = await this.httpService.get(`${this.aiServiceUrl}/validate-model`).pipe(first()).toPromise();

      const validationResult = (response as any).data;
      
      // Log model validation for analytics
      await this.logModelValidation(validationResult);

      this.logger.log(`Model validation completed: ${validationResult.accuracy}% accuracy`);
      
      return {
        accuracy: validationResult.accuracy,
        confidence: validationResult.confidence,
        dataSource: validationResult.training_data_source,
        lastTrained: validationResult.last_trained,
        validationDate: new Date(),
        status: validationResult.accuracy >= 90 ? 'PASS' : 'FAIL',
      };

    } catch (error) {
      this.logger.error('Model validation failed:', error.message);
      throw new HttpException(
        'Model validation failed. Please check AI service status.',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getModelStatus() {
    this.logger.log('Checking AI model status');
    
    try {
      // Call Python FastAPI health endpoint
      const response = await this.httpService.get(`${this.aiServiceUrl}/health`).pipe(first()).toPromise();

      return {
        status: 'healthy',
        version: (response as any).data.version,
        lastChecked: new Date(),
      };

    } catch (error) {
      this.logger.error('AI service health check failed:', error.message);
      return {
        status: 'unhealthy',
        error: error.message,
        lastChecked: new Date(),
      };
    }
  }

  private async logDetectionEvent(snakeDetectionDto: SnakeDetectionDto, aiResult: any, snakeSpecies: any) {
    try {
      // Check if user exists, if not create a default analytics entry
      let userId = snakeDetectionDto.userId;
      if (userId) {
        const userExists = await this.prisma.user.findUnique({
          where: { id: userId }
        });
        if (!userExists) {
          this.logger.warn(`User ${userId} not found, skipping analytics logging`);
          return;
        }
      }

      await this.prisma.analyticsLog.create({
        data: {
          eventType: 'snake_detection',
          metadata: {
            imageUrl: snakeDetectionDto.imageUrl,
            detectedSpecies: aiResult.species,
            confidence: aiResult.confidence,
            verifiedSpecies: snakeSpecies?.scientificName,
            riskLevel: snakeSpecies?.riskLevel,
            venomType: snakeSpecies?.venomType?.name,
          },
          userId: userId || null,
          sessionId: snakeDetectionDto.sessionId,
        },
      });
    } catch (error) {
      this.logger.error('Failed to log detection event:', error.message);
    }
  }

  private async logChatbotEvent(chatbotQueryDto: ChatbotQueryDto, aiResult: any) {
    try {
      await this.prisma.analyticsLog.create({
        data: {
          eventType: 'chatbot_query',
          metadata: {
            query: chatbotQueryDto.query,
            context: chatbotQueryDto.context,
            language: chatbotQueryDto.language,
            response: aiResult.response,
            confidence: aiResult.confidence,
          },
          userId: chatbotQueryDto.userId,
          sessionId: chatbotQueryDto.sessionId,
        },
      });
    } catch (error) {
      this.logger.error('Failed to log chatbot event:', error.message);
    }
  }

  private async logModelValidation(validationResult: any) {
    try {
      await this.prisma.analyticsLog.create({
        data: {
          eventType: 'model_validation',
          metadata: {
            accuracy: validationResult.accuracy,
            confidence: validationResult.confidence,
            trainingDataSource: validationResult.training_data_source,
            lastTrained: validationResult.last_trained,
          },
        },
      });
    } catch (error) {
      this.logger.error('Failed to log model validation:', error.message);
    }
  }
}
