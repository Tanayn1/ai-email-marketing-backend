import { Controller, Post, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { AwsService } from './aws.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';

@Controller('aws')
export class AwsController {
    constructor(private awsService: AwsService) {}

    @Post('uploadToS3')
    @UseGuards(AuthGuard)
    @UseInterceptors(FileInterceptor('file'))
    uploadFile(@UploadedFile() file: Express.Multer.File, @Res() res: Response) {
        return this.awsService.uploadFile(file, res)
    }
}
