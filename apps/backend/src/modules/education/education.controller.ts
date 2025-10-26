import { Controller, Get, Post, Body, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { EducationService } from './education.service';
import { CreateEducationMaterialDto } from './dto/create-education-material.dto';
import { UpdateEducationMaterialDto } from './dto/update-education-material.dto';
import { FindEducationMaterialsDto } from './dto/find-education-materials.dto';

@ApiTags('education')
@Controller('education')
export class EducationController {
  constructor(private readonly educationService: EducationService) {}

  @Get()
  @ApiOperation({ summary: 'Get all education materials' })
  @ApiResponse({ status: 200, description: 'List of education materials retrieved successfully' })
  async findAll(@Query() query: FindEducationMaterialsDto) {
    return this.educationService.findAll(query);
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get all education material categories' })
  @ApiResponse({ status: 200, description: 'Education categories retrieved successfully' })
  async getCategories() {
    return this.educationService.getCategories();
  }

  @Get('languages')
  @ApiOperation({ summary: 'Get all supported languages' })
  @ApiResponse({ status: 200, description: 'Supported languages retrieved successfully' })
  async getLanguages() {
    return this.educationService.getLanguages();
  }

  @Get('featured')
  @ApiOperation({ summary: 'Get featured education materials' })
  @ApiResponse({ status: 200, description: 'Featured materials retrieved successfully' })
  async getFeatured() {
    return this.educationService.getFeatured();
  }

  @Get('search')
  @ApiOperation({ summary: 'Search education materials' })
  @ApiResponse({ status: 200, description: 'Search results retrieved successfully' })
  async search(@Query('q') query: string, @Query('category') category?: string, @Query('language') language?: string) {
    return this.educationService.search(query, category, language);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get education material statistics' })
  @ApiResponse({ status: 200, description: 'Education statistics retrieved successfully' })
  async getStatistics() {
    return this.educationService.getStatistics();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get education material by ID' })
  @ApiResponse({ status: 200, description: 'Education material retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Education material not found' })
  async findOne(@Param('id') id: string) {
    return this.educationService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new education material' })
  @ApiResponse({ status: 201, description: 'Education material created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiBearerAuth()
  async create(@Body() createEducationMaterialDto: CreateEducationMaterialDto) {
    return this.educationService.create(createEducationMaterialDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update education material' })
  @ApiResponse({ status: 200, description: 'Education material updated successfully' })
  @ApiResponse({ status: 404, description: 'Education material not found' })
  @ApiBearerAuth()
  async update(@Param('id') id: string, @Body() updateEducationMaterialDto: UpdateEducationMaterialDto) {
    return this.educationService.update(id, updateEducationMaterialDto);
  }
}
