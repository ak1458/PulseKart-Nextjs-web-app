import {
    Controller,
    Post,
    Get,
    Param,
    Req,
    Res,
    UseGuards,
    UseInterceptors,
    UploadedFile,
    HttpCode,
    HttpStatus,
    ParseUUIDPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
    PrescriptionsService,
    MAX_PRESCRIPTION_BYTES,
} from './prescriptions.service';

interface AuthenticatedRequest {
    user: { sub: number };
}

@Controller('v1/prescriptions')
@UseGuards(JwtAuthGuard)
export class PrescriptionsController {
    constructor(private readonly prescriptionsService: PrescriptionsService) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @Throttle({ default: { limit: 10, ttl: 60000 } })
    @UseInterceptors(
        FileInterceptor('prescription', {
            // Enforced by multer before the body reaches memory, so an
            // oversized upload is rejected without being buffered in full.
            limits: { fileSize: MAX_PRESCRIPTION_BYTES, files: 1 },
        }),
    )
    async upload(
        @Req() req: AuthenticatedRequest,
        @UploadedFile() file: Express.Multer.File,
    ) {
        return this.prescriptionsService.upload(req.user.sub, file);
    }

    @Get()
    async list(@Req() req: AuthenticatedRequest) {
        return this.prescriptionsService.listForUser(req.user.sub);
    }

    @Get(':id/file')
    async download(
        @Param('id', ParseUUIDPipe) id: string,
        @Req() req: AuthenticatedRequest,
        @Res() res: Response,
    ) {
        const prescription = await this.prescriptionsService.getFile(id, req.user.sub);

        res.setHeader('Content-Type', prescription.mimeType);
        // `attachment` prevents a stored PDF or image being rendered inline in
        // the site's own origin.
        res.setHeader(
            'Content-Disposition',
            `attachment; filename="${prescription.fileName}"`,
        );
        res.setHeader('Content-Security-Policy', "default-src 'none'");
        res.send(prescription.content);
    }
}
