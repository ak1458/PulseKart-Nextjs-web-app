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
import { ReviewsService } from '../services/reviews.service';
import { CreateReviewDto, UpdateReviewDto } from '../dto/create-review.dto';
import { JwtAuthGuard, AdminGuard } from '../../auth/jwt-auth.guard';

type ReviewStatus = 'pending' | 'approved' | 'rejected';

interface ReviewFilterOptions {
    productId?: number;
    userId?: number;
    status?: ReviewStatus;
    minRating?: number;
    maxRating?: number;
}

@Controller('v1/reviews')
export class ReviewsController {
    constructor(private readonly reviewsService: ReviewsService) { }

    @Post()
    @UseGuards(JwtAuthGuard)
    create(@Body() createReviewDto: CreateReviewDto) {
        return this.reviewsService.create(createReviewDto);
    }

    @Get()
    findAll(
        @Query('limit') limit: string,
        @Query('offset') offset: string,
        @Query('productId') productId?: string,
        @Query('userId') userId?: string,
        @Query('status') status?: string,
        @Query('minRating') minRating?: string,
        @Query('maxRating') maxRating?: string,
    ) {
        const filters: ReviewFilterOptions = {
            productId: productId ? +productId : undefined,
            userId: userId ? +userId : undefined,
            status: status as ReviewStatus,
            minRating: minRating ? +minRating : undefined,
            maxRating: maxRating ? +maxRating : undefined,
        };

        return this.reviewsService.findAll(
            limit ? parseInt(limit, 10) : 50,
            offset ? parseInt(offset, 10) : 0,
            filters
        );
    }

    @Get('product/:productId')
    findByProduct(
        @Param('productId') productId: string,
        @Query('status') status: string = 'approved'
    ) {
        return this.reviewsService.findByProductId(+productId, status as ReviewStatus);
    }

    @Get('product/:productId/summary')
    getProductRatingSummary(@Param('productId') productId: string) {
        return this.reviewsService.getProductRatingSummary(+productId);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.reviewsService.findOne(+id);
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard)
    update(@Param('id') id: string, @Body() updateReviewDto: UpdateReviewDto) {
        return this.reviewsService.update(+id, updateReviewDto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, AdminGuard)
    remove(@Param('id') id: string) {
        return this.reviewsService.remove(+id);
    }

    @Post(':id/approve')
    @UseGuards(JwtAuthGuard, AdminGuard)
    approve(@Param('id') id: string) {
        return this.reviewsService.approve(+id);
    }

    @Post(':id/reject')
    @UseGuards(JwtAuthGuard, AdminGuard)
    reject(@Param('id') id: string) {
        return this.reviewsService.reject(+id);
    }

    @Post(':id/helpful')
    markHelpful(@Param('id') id: string) {
        return this.reviewsService.markHelpful(+id);
    }
}
