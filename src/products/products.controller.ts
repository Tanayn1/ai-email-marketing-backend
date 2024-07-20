import { Body, Controller, Get, Param, Patch, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ScrapeProduct, UpdateProductDto } from './dto/products.dto';
import { Request, Response } from 'express';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('products')
export class ProductsController {
    constructor(private productsService: ProductsService) {}

    @Post('scrapeProduct')
    @UseGuards(AuthGuard)
    scrapeProduct(@Body() dto: ScrapeProduct, @Req() req : Request, @Res() res : Response) {
        return this.productsService.scrapeProduct(dto, res)
    }

    @Get('getProducts/:id')
    @UseGuards(AuthGuard)
    getProducts(@Param() params, @Req() req , @Res() res: Response) {
        return this.productsService.getProducts(params.id, res)
    }


    @Get('getProductById/:id')
    @UseGuards(AuthGuard)
    getProduct(@Param() params, @Req() req , @Res() res: Response) {
        return this.productsService.getProductById(params.id, res)
    }

    @Patch('updateProduct')
    @UseGuards(AuthGuard)
    updateProduct(@Body() dto: UpdateProductDto ,@Req() req , @Res() res: Response) {
        return this.productsService.updateProduct(dto, res)
    }

    @Post('scrapeProductAi')
    scrapeProductAi(@Body() dto: { url : string }, @Req() req, @Res() res: Response) {
        return this.productsService.scrapeProductAi(dto, res);
    }



}
