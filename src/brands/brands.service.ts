import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import puppeteer from 'puppeteer';
import { PrismaService } from 'src/prisma/prisma.service';
import { ScrapeBrands } from './dto/brands.dto';
import { Response } from 'express';

@Injectable()
export class BrandsService {
    constructor(private prisma: PrismaService) {}

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
                     return element.src;
                 }
                 // For <svg> tags, return the outer HTML as a fallback
                 if (element instanceof SVGElement) {
                     return element.outerHTML;
                 }
             }
             }, selector);
             if (logo) break            
        }
        


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



            //scrape colors
            const colors = await page.evaluate(()=>{
                const colorSet = new Set();
                const elements = document.querySelectorAll('*');

                elements.forEach(el =>{
                    const style = window.getComputedStyle(el);
                    colorSet.add({
                        color: style.color,
                        backgroundColor: style.backgroundColor
                    })
                })
                const colorsArray = Array.from(colorSet)
                
                function processColors(data) {
                    const colorMap = new Map();
                    const backgroundColors = new Map()
                  
                    data.forEach(item => {
                      // Process color
                      if (!colorMap.has(item.color)) {
                        colorMap.set(item.color, { color: item.color, count: 0, backgroundColor: false });
                      }
                      colorMap.get(item.color).count++;
                  
                      // Process backgroundColor
                      if (item.backgroundColor !== "rgba(0, 0, 0, 0)") {
                        if (!backgroundColors.has(item.backgroundColor)) {
                          backgroundColors.set(item.backgroundColor, { color: item.backgroundColor, count: 0, backgroundColor: true });
                        }
                        backgroundColors.get(item.backgroundColor).count++;
                        backgroundColors.get(item.backgroundColor).backgroundColor = true;
                      }
                    });

                    return {colors: Array.from(colorMap.values()), backgroundColors: Array.from(backgroundColors.values())};
                };
                const { colors, backgroundColors } = processColors(colorsArray);
                colors.sort((a, b) => b.count - a.count);
                backgroundColors.sort((a, b) => b.count - a.count);


                return { colors, backgroundColors }
            });

            const fontObj : any =  {             
              primaryFont: fonts.MostUsedPrimaryFont,
              secondaryFont: fonts.MostUsedSecondaryFont
            }
            
            const colorObj = {
              colors: {
                primaryColor: colors.colors[0].color,
                secondaryColors: [...colors.colors]
              },
              backgroundColors: {
                primaryColor: colors.backgroundColors[0].color,
                secondaryColors: [...colors.backgroundColors]
              }
            }

            const brand = await this.prisma.brands.create({data: {
              user_id: userId,
              brand_name: brandName,
              logo: logo,
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
}
