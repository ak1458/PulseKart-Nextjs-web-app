import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    Req,
    UseGuards,
    HttpCode,
    HttpStatus,
    ValidationPipe,
    ParseUUIDPipe,
} from '@nestjs/common';
import { AddressesService } from './addresses.service';
import { CreateAddressDto, UpdateAddressDto } from './dto/address.dto';
import { Address } from './entities/address.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

interface AuthenticatedRequest {
    user: { sub: number };
}

/**
 * Customer address book.
 *
 * Every route is scoped to the signed-in user; there is deliberately no
 * "get any address by id" endpoint.
 */
@Controller('v1/addresses')
@UseGuards(JwtAuthGuard)
export class AddressesController {
    constructor(private readonly addressesService: AddressesService) { }

    @Get()
    async findAll(@Req() req: AuthenticatedRequest): Promise<Address[]> {
        return this.addressesService.findAllForUser(req.user.sub);
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(
        @Req() req: AuthenticatedRequest,
        @Body(new ValidationPipe({ transform: true, whitelist: true })) dto: CreateAddressDto,
    ): Promise<Address> {
        return this.addressesService.create(req.user.sub, dto);
    }

    @Patch(':id')
    async update(
        @Param('id', ParseUUIDPipe) id: string,
        @Req() req: AuthenticatedRequest,
        @Body(new ValidationPipe({ transform: true, whitelist: true })) dto: UpdateAddressDto,
    ): Promise<Address> {
        return this.addressesService.update(id, req.user.sub, dto);
    }

    @Patch(':id/default')
    async setDefault(
        @Param('id', ParseUUIDPipe) id: string,
        @Req() req: AuthenticatedRequest,
    ): Promise<Address> {
        return this.addressesService.setDefault(id, req.user.sub);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(
        @Param('id', ParseUUIDPipe) id: string,
        @Req() req: AuthenticatedRequest,
    ): Promise<void> {
        return this.addressesService.remove(id, req.user.sub);
    }
}
