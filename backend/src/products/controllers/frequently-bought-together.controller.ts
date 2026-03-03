import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { FrequentlyBoughtTogetherService } from '../services/frequently-bought-together.service';
import { CreateFbtDto, UpdateFbtDto } from '../dto/create-fbt.dto';
import { JwtAuthGuard, AdminGuard } from '../../auth/jwt-auth.guard';

@Controller('v1/fbt')
export class FrequentlyBoughtTogetherController {
  constructor(private readonly fbtService: FrequentlyBoughtTogetherService) {}

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  create(@Body() createFbtDto: CreateFbtDto) {
    return this.fbtService.create(createFbtDto);
  }

  @Post('bulk')
  @UseGuards(JwtAuthGuard, AdminGuard)
  bulkCreate(@Body() createFbtDtos: CreateFbtDto[]) {
    return this.fbtService.bulkCreate(createFbtDtos);
  }

  @Get()
  findAll(@Query('limit') limit: string, @Query('offset') offset: string) {
    return this.fbtService.findAll(
      limit ? parseInt(limit, 10) : 50,
      offset ? parseInt(offset, 10) : 0,
    );
  }

  @Get('product/:productId')
  findByProduct(@Param('productId') productId: string) {
    return this.fbtService.findByProductId(+productId);
  }

  @Get('product/:productId/recommendations')
  getRecommendations(@Param('productId') productId: string) {
    return this.fbtService.getRecommendationsForProduct(+productId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.fbtService.findOne(+id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  update(@Param('id') id: string, @Body() updateFbtDto: UpdateFbtDto) {
    return this.fbtService.update(+id, updateFbtDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  remove(@Param('id') id: string) {
    return this.fbtService.remove(+id);
  }
}
