import { Controller, Get, Post, Body, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { StockService } from './stock.service';
import { CreateStockUpdateDto } from './dto/create-stock-update.dto';
import { UpdateStockUpdateDto } from './dto/update-stock-update.dto';
import { FindStockByHospitalDto } from './dto/find-stock-by-hospital.dto';

@ApiTags('stock')
@Controller('stock')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Get()
  @ApiOperation({ summary: 'Get all stock updates' })
  @ApiResponse({ status: 200, description: 'List of stock updates retrieved successfully' })
  async findAll(@Query('status') status?: string) {
    return this.stockService.findAll(status);
  }

  @Get('hospital/:hospitalId')
  @ApiOperation({ summary: 'Get stock updates for a specific hospital' })
  @ApiResponse({ status: 200, description: 'Hospital stock updates retrieved successfully' })
  async findByHospital(@Param('hospitalId') hospitalId: string, @Query() query: FindStockByHospitalDto) {
    return this.stockService.findByHospital(hospitalId, query);
  }

  @Get('low-stock')
  @ApiOperation({ summary: 'Get hospitals with low antivenom stock' })
  @ApiResponse({ status: 200, description: 'Low stock alerts retrieved successfully' })
  async findLowStock(@Query('threshold') threshold?: number) {
    return this.stockService.findLowStock(threshold);
  }

  @Get('expired')
  @ApiOperation({ summary: 'Get expired antivenom stock' })
  @ApiResponse({ status: 200, description: 'Expired stock retrieved successfully' })
  async findExpired() {
    return this.stockService.findExpired();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get stock update by ID' })
  @ApiResponse({ status: 200, description: 'Stock update retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Stock update not found' })
  async findOne(@Param('id') id: string) {
    return this.stockService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new stock update' })
  @ApiResponse({ status: 201, description: 'Stock update created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiBearerAuth()
  async create(@Body() createStockUpdateDto: CreateStockUpdateDto) {
    return this.stockService.create(createStockUpdateDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update stock update status' })
  @ApiResponse({ status: 200, description: 'Stock update updated successfully' })
  @ApiResponse({ status: 404, description: 'Stock update not found' })
  @ApiBearerAuth()
  async update(@Param('id') id: string, @Body() updateStockUpdateDto: UpdateStockUpdateDto) {
    return this.stockService.update(id, updateStockUpdateDto);
  }
}
