import {
    Controller,
    Get,
    Post,
    Delete,
    Param,
    Req,
    UseGuards,
    HttpCode,
    HttpStatus,
    ParseIntPipe,
} from '@nestjs/common';
import { SavedItemsService } from './saved-items.service';
import { SavedItem } from './entities/saved-item.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

interface AuthenticatedRequest {
    user: { sub: number };
}

@Controller('v1/saved-items')
@UseGuards(JwtAuthGuard)
export class SavedItemsController {
    constructor(private readonly savedItemsService: SavedItemsService) { }

    @Get()
    async findAll(@Req() req: AuthenticatedRequest): Promise<SavedItem[]> {
        return this.savedItemsService.findAllForUser(req.user.sub);
    }

    @Post(':productId')
    @HttpCode(HttpStatus.CREATED)
    async add(
        @Param('productId', ParseIntPipe) productId: number,
        @Req() req: AuthenticatedRequest,
    ): Promise<SavedItem> {
        return this.savedItemsService.add(req.user.sub, productId);
    }

    @Delete(':productId')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(
        @Param('productId', ParseIntPipe) productId: number,
        @Req() req: AuthenticatedRequest,
    ): Promise<void> {
        return this.savedItemsService.remove(req.user.sub, productId);
    }
}
