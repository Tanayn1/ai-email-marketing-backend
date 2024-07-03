import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import { ScrapeBrands } from './dto/brands.dto';
import { Request, Response } from 'express';
import { BrandsService } from './brands.service';

@Controller('brands')
export class BrandsController {
    constructor(private brandsService: BrandsService) {}

    @Post('getlogo')
    getLogo(@Body() dto: ScrapeBrands, @Req() req : Request, @Res() res : Response) {
        return this.brandsService.scrapeForBranding(dto, res)
    }
}
