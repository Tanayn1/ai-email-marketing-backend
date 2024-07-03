import { BadRequestException, Injectable } from '@nestjs/common';
import puppeteer from 'puppeteer-core';
import { PrismaService } from 'src/prisma/prisma.service';
import { ScrapeProduct } from './dto/products.dto';

@Injectable()
export class ProductsService {
    constructor(private prisma: PrismaService) {}

    async scrapeProducts(dto :ScrapeProduct) {
        const { url } = dto 
        const browser = await puppeteer.connect({
            browserWSEndpoint: process.env.SBR_WS_ENDPOINT
        });

        try {
            const page = await browser.newPage()
            page.setDefaultNavigationTimeout(2 * 60 * 1000);
            await Promise.all([
                page.waitForNavigation(),
                page.goto(url)
            ]);
            
        } catch (error) {
            return new BadRequestException(error)
        } finally {
            await browser.close()
        }
    }
}
