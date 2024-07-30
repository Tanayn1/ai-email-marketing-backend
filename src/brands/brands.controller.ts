import { Body, Controller, Get, Param, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ScrapeBrands } from './dto/brands.dto';
import { Request, Response } from 'express';
import { BrandsService } from './brands.service';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('brands')
export class BrandsController {
    constructor(private brandsService: BrandsService) {}

    @Post('scrapeBrand')
    @UseGuards(AuthGuard)
    getLogo(@Body() dto: ScrapeBrands, @Req() req , @Res() res : Response) {
        const userId = req.user.sub
        return this.brandsService.scrapeForBranding(dto, res, userId)
    }

    @Get('getBrands')
    @UseGuards(AuthGuard)
    getBrands(@Req() req, @Res() res : Response) {
        const userId = req.user.sub;
        return this.brandsService.getBrands(userId, res)
    }

    @Get(':id')
    @UseGuards(AuthGuard)
    getBrandById(@Param() params, @Req() req, @Res() res : Response  ) {
       const brandId = params.id;
       const userId = req.user.sub;
       return this.brandsService.getBrandById(userId, brandId, res)
    }

    // @Post('test')
    // test(@Body() dto: { url: string }, @Req() req, @Res() res : Response ) {
    //     const { url } = dto
    //     return this.brandsService.scrapeColors(url)
    // }
}
