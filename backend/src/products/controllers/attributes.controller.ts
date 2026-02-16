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
import { AttributesService } from '../services/attributes.service';
import { CreateAttributeDto, UpdateAttributeDto } from '../dto/create-attribute.dto';
import { JwtAuthGuard, AdminGuard } from '../../auth/jwt-auth.guard';

@Controller('v1/attributes')
export class AttributesController {
    constructor(private readonly attributesService: AttributesService) { }

    @Post()
    @UseGuards(JwtAuthGuard, AdminGuard)
    create(@Body() createAttributeDto: CreateAttributeDto) {
        return this.attributesService.create(createAttributeDto);
    }

    @Get()
    findAll() {
        return this.attributesService.findAll();
    }

    @Get('filterable')
    getFilterable() {
        return this.attributesService.getFilterableAttributes();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.attributesService.findOne(+id);
    }

    @Get(':id/products')
    findProducts(@Param('id') id: string) {
        return this.attributesService.findProductsByAttributeId(+id);
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard, AdminGuard)
    update(@Param('id') id: string, @Body() updateAttributeDto: UpdateAttributeDto) {
        return this.attributesService.update(+id, updateAttributeDto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, AdminGuard)
    remove(@Param('id') id: string) {
        return this.attributesService.remove(+id);
    }
}
