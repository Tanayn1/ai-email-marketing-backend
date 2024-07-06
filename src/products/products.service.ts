import { BadRequestException, Injectable } from '@nestjs/common';
import puppeteer from 'puppeteer';
import { PrismaService } from 'src/prisma/prisma.service';
import { ScrapeProduct } from './dto/products.dto';
import { Response } from 'express';

@Injectable()
export class ProductsService {
    constructor(private prisma: PrismaService) {}

    async scrapeProduct(dto :ScrapeProduct, res : Response) {
        const { url, brandId } = dto 
        const browser = await puppeteer.launch();
        console.log('Browser has launched')
        try {
            const page = await browser.newPage()
            page.setDefaultNavigationTimeout(2 * 60 * 1000);
            await Promise.all([
                page.waitForNavigation(),
                page.goto(url)
            ]);
            console.log('Navigated to url')
            //fetch title
             const titleSelectors = [
                'h1[id*="title"]',
                'h1[class*="title"]',
                'h1[itemprop="name"]',
                'h1[id*="product"]',
                'h1[class*="product"]',
                'h2[class*="title"]',
                'h2[id*="title"]',
                'h2[itemprop="name"]',
                '.product-title',
                '.product-name',
                '.product-name-title',
                '.product-title-wrapper',
                '.product-detail-title',
                '.product-detail-header',
                '.product-detail-name',
                '.product-summary',
                '.product-main-title',
                '.product-overview-title',
                '.product-info-title',
                '.product-description-title',
                '.title-product',
                '.title-product-name',
                '.item-title',
                '.item-header',
                '.item-name',
                '.product-header-title',
                'meta[name="title"]',
                'div[class*="product-title"] h1',
                'div[class*="product-name"] h1',
                'span[class*="product-title"] h1',
                'span[class*="product-name"] h1',
                'header[class*="product-title"] h1',
                'header[class*="product-name"] h1',
                'div[itemprop="name"] h1',
                'span[itemprop="name"] h1',
                'title'
            ];
            let title : null | string | Promise<string> = null;
            for (let index = 0; index < titleSelectors.length; index++) {
                const selector = titleSelectors[index];
                title = await page.evaluate((selector)=>{
                    const element = document.querySelector(selector);
                    if (element) {
                        if (selector.startsWith('meta')) {
                          return element.getAttribute('content');
                        } else if (element instanceof HTMLElement) {
                          return element.innerText || element.textContent;
                        }
                      } 

                }, selector)

                if (title) break;
                
            }
            console.log(title)
            //fetch price 
            const priceSelectors = [
                '.price',
                '.product-price',
                '.product-price-value',
                '.price-wrapper',
                '.price-value',
                '.price-amount',
                '.product-price-amount',
                '.product-price-wrapper',
                '.price-tag',
                '.price-label',
                '.current-price',
                '.sale-price',
                '.discounted-price',
                '.offer-price',
                '.product-discount-price',
                '.regular-price',
                'p[class*="price"]',
                'p[id*="price"]',
                'h1[id*="price"]',
                'h1[class*="price"]',
                'h1[itemprop="price"]',
                'h1[id*="price"]',
                'h2[class*="price"]',
                'h2[id*="price"]',
                'h2[itemprop="price"]',
                'span[class*="price"]',
                'span[id*="price"]',
                'span[itemprop="price"]',
                'div[id*="price"]',
                'div[class*="price"]',
                'div[itemprop="price"]',
                'div[id*="price"]',
            ]
            let price = null
            for (let index = 0; index < priceSelectors.length; index++) {
                const selector = priceSelectors[index];
                price = await page.evaluate((selector)=>{
                    const element = document.querySelector(selector)
                    if (element) {
                        if (selector.startsWith('meta')) {
                          return (element as HTMLMetaElement).getAttribute('content');
                        } else {
                          return (element as HTMLElement).innerText || element.textContent;
                        }
                      }
                }, selector)

                if (price) break
            };
            console.log(price)
            //fetch description
            const descriptionSelectors = [
                'div[id*="description"]',
                'div[class*="description"]',
                'div[itemprop="description"]',
                'p[class*="description"]',
                'p[id*="description"]',
                'span[class*="description"]',
                'span[id*="description"]',
                '.product-description',
                '.product-details',
                '.product-summary',
                '.product-overview',
                '.product-info',
                '.product-text',
                '.product-body',
                '.product-content',
                '.item-description',
                '.item-details',
                '.item-summary',
                '.description-content',
                '.description-text',
                '.description-body',
                '.description-wrapper',
                '.product-detail-description',
                '.product-detail-info',
                '.product-detail-summary',
                '.product-description-text',
                'div[data-testid="product-description"]',
                'div[data-test="product-description"]',
                'div[role="document"] .description'
            ];

            const descriptions = []

            for (let index = 0; index < descriptionSelectors.length; index++) {
                const selector = descriptionSelectors[index];
                const elementsText = await page.evaluate((selector) => {
                    const elements = document.querySelectorAll(selector);
                    const textContents = [];
                    elements.forEach((element) => {
                        textContents.push(element.textContent.trim());
                    });
                    return textContents;
                }, selector);
            
                descriptions.push(...elementsText);
            } 

            console.log(descriptions)

            //fetch product photos
            const photoSelectors = [
                '.product-gallery',
                '.product-images',
                '.product-photos',
                '.product-media',
                '#product-image-container',
                '.product-image-slider',
                '.product-carousel',
                '.image-carousel',
                '.slick-slider',
                '.owl-carousel',
                '.main-image',
                '.featured-image',
                '.primary-image',
                '.product-thumbnails',
                '.thumbnail-gallery',
                '.woocommerce-product-gallery',
                '.shopify-section',
                '[data-product-images]',
                '[data-gallery]',
                '[data-slider]',
                '.image-container',
                '.photo-container',
                '[class*="product"][class*="image"]',
                '[class*="product"][class*="photo"]'
            ];
            const photosArray = []
            for (let index = 0; index < photoSelectors.length; index++) {
                const selector = photoSelectors[index];
                const photos = await page.evaluate((selector)=>{
                        const urls = new Set();
                        // Get src from img tags
                        document.querySelectorAll(`${selector} img`).forEach((img : any) => {
                          if (img.src) urls.add(img.src);
                        });
                  
                        // Get srcset from source tags within picture elements
                        document.querySelectorAll(`${selector} picture source`).forEach((source : any) => {
                          if (source.srcset) {
                            // Split srcset and get the first URL (typically the highest resolution)
                            const firstSrc = source.srcset.split(',')[0].split(' ')[0];
                            urls.add(firstSrc);
                          }
                        });
                        return Array.from(urls);
                }, selector)

                photosArray.push(...photos)

                
            }
           
            
            
            // fetch reviews

            //upload to prisma db
            const product = await this.prisma.products.create({ data: {
                brand_id: brandId,
                product_url: url,
                product_name: title as string,
                images: photosArray,
                description: descriptions,
                price: price
                
            } })

            res.send({message: 'Success', product}).status(200)
            
        } catch (error) {
            return new BadRequestException(error)
        } finally {
            await browser.close()
        }
    }
}
