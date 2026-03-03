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
import { TagsService } from '../services/tags.service';
import { CreateTagDto, UpdateTagDto } from '../dto/create-tag.dto';
import { JwtAuthGuard, AdminGuard } from '../../auth/jwt-auth.guard';

@Controller('v1/tags')
export class TagsController {
    constructor(private readonly tagsService: TagsService) { }

    @Post()
    @UseGuards(JwtAuthGuard, AdminGuard)
    create(@Body() createTagDto: CreateTagDto) {
        return this.tagsService.create(createTagDto);
    }

    @Get()
    findAll() {
        return this.tagsService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.tagsService.findOne(+id);
    }

    @Get(':id/products')
    findProducts(@Param('id') id: string) {
        return this.tagsService.findProductsByTagId(+id);
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard, AdminGuard)
    update(@Param('id') id: string, @Body() updateTagDto: UpdateTagDto) {
        return this.tagsService.update(+id, updateTagDto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, AdminGuard)
    remove(@Param('id') id: string) {
        return this.tagsService.remove(+id);
    }
}
