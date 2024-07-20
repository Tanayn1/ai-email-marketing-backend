import { BadRequestException, Injectable } from '@nestjs/common';
import puppeteer from 'puppeteer';
import { PrismaService } from 'src/prisma/prisma.service';
import { ScrapeProduct, UpdateProductDto } from './dto/products.dto';
import { Response } from 'express';
import OpenAI from 'openai';

@Injectable()
export class ProductsService {
    private readonly openAi: OpenAI

    constructor(private prisma: PrismaService) {
        this.openAi = new OpenAI({
            apiKey: process.env.OPEN_AI_KEY
        })
    }

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

            let descriptions = ''

            for (let index = 0; index < descriptionSelectors.length; index++) {
                const selector = descriptionSelectors[index];
                const elementsText = await page.evaluate((selector) => {
                    const elements = document.querySelectorAll(selector);
                    let textContents = '';
                    elements.forEach((element) => {
                        textContents = textContents + element.textContent.trim();
                    });
                    return textContents;
                }, selector);
            
                descriptions = descriptions + elementsText
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
           
            //filterPhotos
            for (let i = photosArray.length - 1; i >= 0; i--) {
                let url = photosArray[i];
                if (!url.startsWith("https://")) {
                  photosArray.splice(i, 1);
                }
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

    async getProducts(brandId : string, res : Response) {
        const products = await this.prisma.products.findMany({ where: { brand_id: brandId } })
        return res.send({ message: 'Success', products }).status(200);
    }

    async getProductById(prodId : string, res : Response) {
        const product = await this.prisma.products.findUnique({ where: { id: prodId }});
        return res.send({ message: 'Success', product }).status(200);
    }

    async updateProduct(dto: UpdateProductDto, res: Response) {
        const { product_id, product_name, price, description, images } = dto
        const updatedProd = await this.prisma.products.update({ where: { id: product_id }, data: {product_name, price, description, images}})
        return res.send({ message: 'Success', updatedProd }).status(200)
    }

    async scrapeProductAi(dto: { url: string }, res : Response) {
        const {url} = dto;
        const browser = await puppeteer.launch()
        console.log('Browser Has Launched')
        try {
            const page = await browser.newPage()
            page.setDefaultNavigationTimeout(2 * 60 * 1000);
            await Promise.all([
                page.waitForNavigation(),
                page.goto(url)
            ]);
            console.log('Navigated to url');
            const html = await page.evaluate(()=>{
                const divs = document.querySelectorAll('div');
                return Array.from(divs).map(div => div.innerHTML);
            });
            const jsonFormat = {
                "product_title":"{{title of product}}",
                "product_images":["{{array of images}}"],
                "price":"{{price}}",
                "reviews": [{"review": "{{review}}", "name":"{{name of person who did review}}"}],
                "descriptions": ["{{array of product descriptions or information}}"]
            }
           const products = await this.openAi.chat.completions.create({
               model: 'gpt-4o-mini',
               messages: [
                   {
                       role: 'system', 
                       content: `You are a scraper that extracts product details from websites. Return all responses in a valid JSON format. Use the following format: ${jsonFormat} \nIf any of these values are not present, please return them as null.
`
                   }, {
                       role: 'user',
                       content: ` Here is the HTML content: ${html} \n Please extract and return the product title, images, price, descriptions, and reviews. If any of these values are not present in the HTML, please return them as null.`
                   }
               ],
               response_format: { type:'json_object' }
           })

           console.log(products)
           if (!products.choices[0].message.content) return new BadRequestException('Html to large')
           return res.send({message: 'Success', product: products.choices[0].message.content}).status(200)


        } catch (error) {
            console.log(error)
            return new BadRequestException(error)
        } finally {
            await browser.close()
        }

    }
}
