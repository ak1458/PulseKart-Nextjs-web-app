import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    UseGuards,
} from '@nestjs/common';
import { BrandsService } from '../services/brands.service';
import { CreateBrandDto, UpdateBrandDto } from '../dto/create-brand.dto';
import { JwtAuthGuard, AdminGuard } from '../../auth/jwt-auth.guard';

@Controller('v1/brands')
export class BrandsController {
    constructor(private readonly brandsService: BrandsService) { }

    @Post()
    @UseGuards(JwtAuthGuard, AdminGuard)
    create(@Body() createBrandDto: CreateBrandDto) {
        return this.brandsService.create(createBrandDto);
    }

    @Get()
    findAll() {
        return this.brandsService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.brandsService.findOne(+id);
    }

    @Get(':id/products')
    findProducts(@Param('id') id: string) {
        return this.brandsService.findProductsByBrandId(+id);
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard, AdminGuard)
    update(@Param('id') id: string, @Body() updateBrandDto: UpdateBrandDto) {
        return this.brandsService.update(+id, updateBrandDto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, AdminGuard)
    remove(@Param('id') id: string) {
        return this.brandsService.remove(+id);
    }
}
