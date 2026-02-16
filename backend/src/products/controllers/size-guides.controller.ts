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
import { SizeGuidesService } from '../services/size-guides.service';
import { CreateSizeGuideDto, UpdateSizeGuideDto } from '../dto/create-size-guide.dto';
import { JwtAuthGuard, AdminGuard } from '../../auth/jwt-auth.guard';

@Controller('v1/size-guides')
export class SizeGuidesController {
    constructor(private readonly sizeGuidesService: SizeGuidesService) { }

    @Post()
    @UseGuards(JwtAuthGuard, AdminGuard)
    create(@Body() createSizeGuideDto: CreateSizeGuideDto) {
        return this.sizeGuidesService.create(createSizeGuideDto);
    }

    @Get()
    findAll() {
        return this.sizeGuidesService.findAll();
    }

    @Get('category/:categoryId')
    findByCategory(@Param('categoryId') categoryId: string) {
        return this.sizeGuidesService.findByCategoryId(+categoryId);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.sizeGuidesService.findOne(+id);
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard, AdminGuard)
    update(@Param('id') id: string, @Body() updateSizeGuideDto: UpdateSizeGuideDto) {
        return this.sizeGuidesService.update(+id, updateSizeGuideDto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, AdminGuard)
    remove(@Param('id') id: string) {
        return this.sizeGuidesService.remove(+id);
    }
}
