import {
    IsString,
    IsOptional,
    IsBoolean,
    IsEnum,
    Length,
    Matches,
} from 'class-validator';
import { AddressLabel } from '../entities/address.entity';

export class CreateAddressDto {
    @IsOptional()
    @IsEnum(AddressLabel)
    label?: AddressLabel;

    @IsString()
    @Length(2, 120)
    recipientName: string;

    // Indian mobile numbers are ten digits starting 6-9.
    @IsString()
    @Matches(/^[6-9]\d{9}$/, { message: 'Enter a valid 10-digit mobile number' })
    phone: string;

    @IsString()
    @Length(10, 255, { message: 'Address must be at least 10 characters' })
    line1: string;

    @IsString()
    @Length(2, 80)
    city: string;

    @IsString()
    @Matches(/^\d{6}$/, { message: 'Pincode must be 6 digits' })
    pincode: string;

    @IsOptional()
    @IsBoolean()
    isDefault?: boolean;
}

export class UpdateAddressDto {
    @IsOptional()
    @IsEnum(AddressLabel)
    label?: AddressLabel;

    @IsOptional()
    @IsString()
    @Length(2, 120)
    recipientName?: string;

    @IsOptional()
    @IsString()
    @Matches(/^[6-9]\d{9}$/, { message: 'Enter a valid 10-digit mobile number' })
    phone?: string;

    @IsOptional()
    @IsString()
    @Length(10, 255)
    line1?: string;

    @IsOptional()
    @IsString()
    @Length(2, 80)
    city?: string;

    @IsOptional()
    @IsString()
    @Matches(/^\d{6}$/, { message: 'Pincode must be 6 digits' })
    pincode?: string;

    @IsOptional()
    @IsBoolean()
    isDefault?: boolean;
}
