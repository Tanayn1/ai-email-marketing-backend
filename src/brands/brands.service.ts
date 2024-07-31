import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import puppeteer, { Page } from 'puppeteer';
import { PrismaService } from 'src/prisma/prisma.service';
import { AddLogoDto, ScrapeBrands, UpdateBrandsDto } from './dto/brands.dto';
import { Response } from 'express';
import { AwsService } from 'src/aws/aws.service';
import axios from 'axios';
import * as sharp from 'sharp';


@Injectable()
export class BrandsService {
    constructor(private prisma: PrismaService, private aws: AwsService) {}

    async scrapeForBranding(dto : ScrapeBrands, res : Response, userId :string) {
        const { url, brandName } = dto 
        const browser = await puppeteer.launch()
        console.log('Browser has launched')
       try {
        const page = await browser.newPage()
        page.setDefaultNavigationTimeout(2 * 60 * 1000);
        await Promise.all([
            page.waitForNavigation(),
            page.goto(url)
        ])
        console.log('Navigated to url')
        console.log('Starting logo processing...');
        //scrape logo
        const logoSelectors : Array<string> = [
            'img[alt*="logo"]', 'svg[alt*="logo"]', '[id*="logo"] img', 
            '[id*="logo"] svg', 'img[id*="logo"]', '[class*="logo"] svg', 
            'header img', 'header svg', 'nav img', 
            'nav svg', 
        ]
        let logo = null
        for (let index = 0; index < logoSelectors.length; index++) {
            const selector = logoSelectors[index];
            logo = await page.evaluate((selector)=>{
                const element = document.querySelector(selector)
 
                if (element) {
                 // For <img> tags, return the 'src' attribute
                 if (element instanceof HTMLImageElement) {
                  return { type: 'img', src: element.src };                 
                }
                 // For <svg> tags, return the outer HTML as a fallback
                 if (element instanceof SVGElement) {
                  return { type: 'svg', content: element.outerHTML };
                }
             }
             }, selector);
             if (logo) break            
        }
        console.log('Logo scraping result:', logo);
        let logosrc = null
        if (logo.type === 'img') {
          const response = await axios.get(logo.src, { responseType: 'arraybuffer' });
          const buffer = Buffer.from(response.data, 'binary');
          logosrc = await this.aws.uploadFileSVGorImg(buffer, `${brandName}_logo`, 'image/png')
        } else if (logo.type === 'svg') {
          try {
            const buffer = await sharp(Buffer.from(logo.content))
            .png()
            .toBuffer();
            logosrc = await this.aws.uploadFileSVGorImg(buffer, `${brandName}_logo`, 'image/png')
          } catch (error) {
            console.log(error)
          }

        }
        console.log('Successfully uploaded to S3:', logosrc);


        //scrape fonts
        const fonts = await page.evaluate(()=>{
            const primaryFontFamilies = new Set();
            const secondaryFontFamilies = new Set()

            const primaryFonts = document.querySelectorAll('h1, h2, h3, h4, h5')

            const secondaryFonts = document.querySelectorAll('p')
            const primaryFontCounts = {};
            const secondaryFontCounts ={}
            primaryFonts.forEach(el => {
                const style = window.getComputedStyle(el);
                const fontFamily = style.getPropertyValue('font-family');
                primaryFontFamilies.add(fontFamily.split(',')[0].trim().replace(/['"]/g, ''));

                if (fontFamily) {
                    if (!primaryFontCounts[fontFamily]) {
                      primaryFontCounts[fontFamily] = 0;
                    }
                    primaryFontCounts[fontFamily]++;
                  }
              });
            secondaryFonts.forEach(el => {
            const style = window.getComputedStyle(el);
            const fontFamily = style.getPropertyValue('font-family');
            secondaryFontFamilies.add(fontFamily.split(',')[0].trim().replace(/['"]/g, ''));
            if (fontFamily) {
                if (!secondaryFontCounts[fontFamily]) {
                  secondaryFontCounts[fontFamily] = 0;
                }
                secondaryFontCounts[fontFamily]++;
              }

            });

            const primaryFontsArray = Array.from(primaryFontFamilies);
            const secondaryFontsArray = Array.from(secondaryFontFamilies);
            const primaryFontCountsArray : Array<number> = Object.values(primaryFontCounts);
            const secondaryFontCountsArray : Array<number> = Object.values(secondaryFontCounts);
            const indexOfMostUsedPrimaryFont = primaryFontCountsArray.indexOf(Math.max(...primaryFontCountsArray));
            const indexOfMostUsedSecondaryFont = secondaryFontCountsArray.indexOf(Math.max(...secondaryFontCountsArray));
            console.log('indexes',indexOfMostUsedPrimaryFont, indexOfMostUsedSecondaryFont)


            return { primaryFonts: Array.from(primaryFontFamilies), 
                secondaryFonts: Array.from(secondaryFontFamilies), 
                primaryFontCounts, secondaryFontCounts, 
                MostUsedPrimaryFont: primaryFontsArray[indexOfMostUsedPrimaryFont],
                MostUsedSecondaryFont: secondaryFontsArray[indexOfMostUsedSecondaryFont]};    
            });



            // //scrape colors
            // const colors = await page.evaluate(()=>{
            //     const colorSet = new Set();
            //     const elements = document.querySelectorAll('*');

            //     elements.forEach(el =>{
            //         const style = window.getComputedStyle(el);
            //         colorSet.add({
            //             color: style.color,
            //             backgroundColor: style.backgroundColor
            //         })
            //     })
            //     const colorsArray = Array.from(colorSet)
                
            //     function processColors(data) {
            //         const colorMap = new Map();
            //         const backgroundColors = new Map()
                  
            //         data.forEach(item => {
            //           // Process color
            //           if (!colorMap.has(item.color)) {
            //             colorMap.set(item.color, { color: item.color, count: 0, backgroundColor: false });
            //           }
            //           colorMap.get(item.color).count++;
                  
            //           // Process backgroundColor
            //           if (item.backgroundColor !== "rgba(0, 0, 0, 0)") {
            //             if (!backgroundColors.has(item.backgroundColor)) {
            //               backgroundColors.set(item.backgroundColor, { color: item.backgroundColor, count: 0, backgroundColor: true });
            //             }
            //             backgroundColors.get(item.backgroundColor).count++;
            //             backgroundColors.get(item.backgroundColor).backgroundColor = true;
            //           }
            //         });

            //         return {colors: Array.from(colorMap.values()), backgroundColors: Array.from(backgroundColors.values())};
            //     };
            //     const { colors, backgroundColors } = processColors(colorsArray);
            //     colors.sort((a, b) => b.count - a.count);
            //     backgroundColors.sort((a, b) => b.count - a.count);


            //     return { colors, backgroundColors }
            // });

            const fontObj : any =  {             
              primaryFont: fonts.MostUsedPrimaryFont,
              secondaryFont: fonts.MostUsedSecondaryFont
            }
            
            // const colorObj = {
            //   colors: {
            //     primaryColor: colors.colors[0].color,
            //     secondaryColors: [...colors.colors]
            //   },
            //   backgroundColors: {
            //     primaryColor: colors.backgroundColors[0].color,
            //     secondaryColors: [...colors.backgroundColors]
            //   }
            // }

            const colorObj = await this.scrapeColors(page)

            const brand = await this.prisma.brands.create({data: {
              user_id: userId,
              brand_name: brandName,
              logos: [logosrc],
              fonts: fontObj,
              colors: colorObj,
              brand_url: url
            }})

        return res.send({message: 'Success', brand})
       } catch (error) {
            return new BadRequestException(error)
       } finally {
        await browser.close()
       }
    }

    async getBrands(userId : string, res : Response) {
      const brands = await this.prisma.brands.findMany({where: { user_id: userId}})
      return res.send({ message: 'Success', brands }).status(200)
    }

    async getBrandById(userId : string, brandId: string, res : Response) {
      const brand = await this.prisma.brands.findUnique({ where: { id: brandId } })
      if (!brand) return new BadRequestException('No such brand with given id');
      if (userId === brand.user_id) {
        return res.send({ message: 'Success', brand }).status(200);
      } else {
        return new UnauthorizedException('User is not authorized to access this store');
      }
    }


    async scrapeColors(page: Page) {
      // const browser = await puppeteer.launch();
      // console.log('Browser Opened')
      try {
        // const page = await browser.newPage()
        // page.setDefaultNavigationTimeout(2 * 60 * 1000);
        // await Promise.all([
        //     page.waitForNavigation(),
        //     page.goto(url)
        // ])
        // console.log('Navigated to url')
        const colors = await page.evaluate(() => {
          function rgbToHex(r, g, b) {
            return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
          }
  
          function getColorFrequency() {
            const elements = document.body.getElementsByTagName('*');
            const colorMap = {};
  
            for (let element of elements) {
              const style = window.getComputedStyle(element);
              const bgColor = style.backgroundColor;
              const textColor = style.color;
  
              if (bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
                colorMap[bgColor] = (colorMap[bgColor] || 0) + 1;
              }
              colorMap[textColor] = (colorMap[textColor] || 0) + 1;
            }
  
            return Object.entries(colorMap)
              .sort((a : any, b: any) => b[1] - a[1])
              .map(([color]) => color);
          }
  
          const colorFrequency = getColorFrequency();
  
          return {
            textColor: colorFrequency[0] || null,
            buttonColor: colorFrequency[1] || null,
            backgroundColor: colorFrequency[2] || null,
            secondaryBackgroundColor: colorFrequency[3] || null
          };
        });
        console.log(colors)
        return colors;
      } catch (error) {
        console.log(error)
       } //finally {
      //    await browser.close();
      // }


     
  }

    async addLogo(dto: AddLogoDto, user_id: string,  res: Response) {
      const { brandId, logo } = dto;
      const brand = await this.prisma.brands.findUnique({ where: {id: brandId } });
      if (!brand) return new BadRequestException(`Brand with id: ${brandId} does not exist`);
      const updatedBrand = await this.prisma.brands.update({ where: { id: brandId }, data: { logos: [...brand.logos, logo] } })
      return res.send({ message: 'Success', updatedBrand }).status(200)
    }

    async updateBrands(dto: UpdateBrandsDto, user_id: string,  res: Response) {
      const { brandName, fonts, colors, logos, brandId } = dto;
      const updatedBrand = await this.prisma.brands.update({ where: {id: brandId}, data: {
        brand_name: brandName,
        fonts: JSON.stringify(fonts),
        colors: JSON.stringify(colors),
        logos: logos
      } });

      return res.send({ message: 'Success', updatedBrand }).status(200);
    }

}
