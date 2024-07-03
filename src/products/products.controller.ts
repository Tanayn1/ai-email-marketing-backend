import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ScrapeProduct } from './dto/products.dto';
import { Request, Response } from 'express';

@Controller('products')
export class ProductsController {
    constructor(private productsService: ProductsService) {}

    @Post('scrapeProduct')
    scrapeProduct(@Body() dto: ScrapeProduct, @Req() req : Request, @Res() res : Response) {
        return this.productsService.scrapeProduct(dto, res)
    }
}
